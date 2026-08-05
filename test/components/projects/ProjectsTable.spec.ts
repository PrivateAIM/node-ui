import { useToast } from "primevue/usetoast";
import { computed, defineComponent } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import ProjectsTable from "~/components/projects/ProjectsTable.vue";
import { getProjectNodes } from "~/composables/useAPIFetch";
import { useDatastoreRequirement } from "~/composables/useDatastoreRequirement";
import { useProjectAnalysisSummary } from "~/composables/useProjectAnalysisSummary";
import type { ProjectAnalysisSummary } from "~/utils/summarise-project-analyses";
import { emptyProjectAnalysisSummary } from "~/utils/summarise-project-analyses";
import type { ProjectNode } from "~/services/Api";
import {
  FAKE_PROJECT_ID,
  fakeProposalsResp,
  fakeTwoProposalsResp,
  SECOND_FAKE_PROJECT_ID,
} from "@/test/components/projects/constants";

vi.mock("~/composables/useAPIFetch", () => ({
  getProjectNodes: vi.fn(),
}));

vi.mock("~/composables/useDatastoreRequirement", () => ({
  useDatastoreRequirement: vi.fn(),
}));

vi.mock("~/composables/useProjectAnalysisSummary", () => ({
  useProjectAnalysisSummary: vi.fn(),
}));

function mockProjectNodes(
  data: ProjectNode[] | undefined,
  status: "success" | "error" = "success",
) {
  vi.mocked(getProjectNodes).mockResolvedValue({
    data: ref(data),
    pending: ref(false),
    error: ref(undefined),
    status: ref(status),
    refresh: vi.fn(),
    execute: vi.fn(),
    clear: vi.fn(),
  });
}

function mockSummaries(
  entries: Record<string, Partial<ProjectAnalysisSummary>>,
  composableOverrides: { truncated?: boolean; loading?: boolean } = {},
) {
  const summaries = new Map<string, ProjectAnalysisSummary>(
    Object.entries(entries).map(([projectId, overrides]) => [
      projectId,
      { ...emptyProjectAnalysisSummary(true), ...overrides },
    ]),
  );

  vi.mocked(useProjectAnalysisSummary).mockReturnValue({
    summaries: ref(summaries),
    dataStoreProjectIds: ref(new Set(summaries.keys())),
    loading: ref(composableOverrides.loading ?? false),
    truncated: ref(composableOverrides.truncated ?? false),
    refreshSummaries: vi.fn(),
    // Id-aware on purpose: a mock that ignored its argument would pass even if
    // the component looked the summary up by the wrong id (row.id, node_id...).
    summaryFor: (id: string | undefined | null) =>
      (id ? summaries.get(id) : undefined) ??
      emptyProjectAnalysisSummary(false),
  } as never);
}

function mockSummary(
  overrides: Partial<ProjectAnalysisSummary> = {},
  composableOverrides: { truncated?: boolean; loading?: boolean } = {},
) {
  mockSummaries({ [FAKE_PROJECT_ID]: overrides }, composableOverrides);
}

describe("ProjectsTable.vue", () => {
  let mockToast;
  let ProjectsTableTestComponent;

  beforeEach(() => {
    vi.restoreAllMocks(); // Reset mocks before each test
    vi.mocked(useToast).mockReturnValue(mockToast);

    vi.mocked(useDatastoreRequirement).mockReturnValue({
      nodeType: computed(() => "default"),
      requireDataStore: computed(() => true),
    } as never);
    mockSummary({ total: 6, executed: 4, running: 2 });
  });

  // Render the component with the fake params
  beforeAll(async () => {
    ProjectsTableTestComponent = defineComponent({
      components: { ProjectsTable },
      template: "<Suspense><ProjectsTable/></Suspense>",
    });
  });

  test("Return project data", async () => {
    mockProjectNodes(fakeProposalsResp);

    const wrapper = mount(ProjectsTableTestComponent);
    await flushPromises();

    expect(ProjectsTableTestComponent).toBeTruthy();
    expect(wrapper.text()).toContain("Projects"); // Card title

    // Find header and all rows
    const rows = wrapper.findAll("tbody tr");
    expect(rows.length).toBe(1); // Ensure 1 row exists as defined in fakeProposalsResp

    // Verify header contents
    const headerRow = wrapper.findAll("thead tr");
    expect(headerRow.length).toBe(1);
    const headerCols = headerRow[0].findAll("th");
    expect(headerCols.length).toBe(7);
    expect(headerCols[0].text()).toBe("Project Name");
    expect(headerCols[1].text()).toBe("Analyses");
    expect(headerCols[2].text()).toBe("Nodes");
    expect(headerCols[3].text()).toBe("Status");
    expect(headerCols[4].text()).toBe("Data Store");
    expect(headerCols[5].text()).toBe("Created On");
    expect(headerCols[6].text()).toBe("Last Updated");

    // Verify the row's content
    const rowCells = rows[0].findAll("td");
    expect(rowCells[0].text()).toBe("fake-project"); // Project name
    expect(rowCells[1].text()).toBe("6"); // Node-local analyses, not project.analyses (17)
    expect(rowCells[2].text()).toBe("0"); // Number of nodes
  });

  test("Marks a project that has a data store", async () => {
    mockSummary({ total: 2, executed: 2, hasDataStore: true });
    mockProjectNodes(fakeProposalsResp);

    const wrapper = mount(ProjectsTableTestComponent);
    await flushPromises();

    const dataStoreCell = wrapper.findAll("tbody tr")[0].findAll("td")[4];
    expect(dataStoreCell.find(".pi-check").exists()).toBe(true);
  });

  test("Links a project with no data store to data store creation", async () => {
    mockSummary({ total: 2, waiting: 2, hasDataStore: false });
    mockProjectNodes(fakeProposalsResp);

    const wrapper = mount(ProjectsTableTestComponent);
    await flushPromises();

    const dataStoreCell = wrapper.findAll("tbody tr")[0].findAll("td")[4];
    expect(dataStoreCell.find(".pi-times").exists()).toBe(true);
    expect(dataStoreCell.find("button").attributes("aria-label")).toContain(
      "create a data store",
    );
  });

  test("Hides the data store column on an aggregator node", async () => {
    vi.mocked(useDatastoreRequirement).mockReturnValue({
      nodeType: computed(() => "aggregator"),
      requireDataStore: computed(() => false),
    } as never);
    mockSummary({ total: 2, executed: 2, hasDataStore: false });
    mockProjectNodes(fakeProposalsResp);

    const wrapper = mount(ProjectsTableTestComponent);
    await flushPromises();

    const headerCols = wrapper.findAll("thead tr")[0].findAll("th");
    expect(headerCols.length).toBe(6);
    expect(headerCols.map((col) => col.text())).not.toContain("Data Store");
  });

  test("Follows the data store requirement when it resolves late", async () => {
    // The node settings plugin does not await fetchSettings(), so the getter
    // sits at its default `true` until the request lands.
    const requireDataStore = ref(true);
    vi.mocked(useDatastoreRequirement).mockReturnValue({
      nodeType: computed(() => "default"),
      requireDataStore,
    } as never);
    mockSummary({ total: 3, failed: 2, idle: 1, hasDataStore: false });
    mockProjectNodes(fakeProposalsResp);

    const wrapper = mount(ProjectsTableTestComponent);
    await flushPromises();

    const dataStoreCell = () => wrapper.findAll("tbody tr")[0].findAll("td")[4];
    expect(dataStoreCell().find("button").exists()).toBe(true);

    requireDataStore.value = false;
    await flushPromises();

    // A data store that is not required must stop prompting for creation.
    expect(dataStoreCell().find("button").exists()).toBe(false);
  });

  test("Renders one meter segment per non-empty bucket", async () => {
    mockSummary({ total: 6, executed: 3, failed: 2, idle: 1 });
    mockProjectNodes(fakeProposalsResp);

    const wrapper = mount(ProjectsTableTestComponent);
    await flushPromises();

    const statusCell = wrapper.findAll("tbody tr")[0].findAll("td")[3];
    const segments = statusCell.findAll(".status-meter-seg");
    expect(segments.length).toBe(3); // executed, failed, idle — not the empty buckets
    expect(segments[0].classes()).toContain("status-meter-executed");
    expect(segments[1].classes()).toContain("status-meter-failed");
    expect(segments[2].classes()).toContain("status-meter-idle");
  });

  test("Exposes the meter counts to assistive technology", async () => {
    mockSummary({ total: 6, executed: 3, failed: 2, idle: 1 });
    mockProjectNodes(fakeProposalsResp);

    const wrapper = mount(ProjectsTableTestComponent);
    await flushPromises();

    const meter = wrapper.findAll("tbody tr")[0].find(".status-meter");
    expect(meter.attributes("role")).toBe("img");
    expect(meter.attributes("aria-label")).toBe("3 executed\n2 failed\n1 idle");
  });

  test("Renders no meter when the project has no analyses on this node", async () => {
    mockSummary({ total: 0 });
    mockProjectNodes(fakeProposalsResp);

    const wrapper = mount(ProjectsTableTestComponent);
    await flushPromises();

    const statusCell = wrapper.findAll("tbody tr")[0].findAll("td")[3];
    expect(statusCell.findAll(".status-meter-seg").length).toBe(0);
  });

  test("Renders the legend once, above the table", async () => {
    mockSummary({ total: 3, executed: 3 });
    mockProjectNodes(fakeProposalsResp);

    const wrapper = mount(ProjectsTableTestComponent);
    await flushPromises();

    expect(wrapper.findAll(".status-legend").length).toBe(1);
  });

  test("Warns that the counts are partial when pagination was truncated", async () => {
    mockSummary({ total: 3, executed: 3 }, { truncated: true });
    mockProjectNodes(fakeProposalsResp);

    const wrapper = mount(ProjectsTableTestComponent);
    await flushPromises();

    const warning = wrapper.find(".status-truncation-warning");
    expect(warning.exists()).toBe(true);
    expect(warning.text()).toContain("partial");
  });

  test("Shows no truncation warning when everything was loaded", async () => {
    mockSummary({ total: 3, executed: 3 }, { truncated: false });
    mockProjectNodes(fakeProposalsResp);

    const wrapper = mount(ProjectsTableTestComponent);
    await flushPromises();

    expect(wrapper.find(".status-truncation-warning").exists()).toBe(false);
  });

  test("Sorts rows by project name", async () => {
    mockSummaries({
      [FAKE_PROJECT_ID]: { total: 4, executed: 4 },
      [SECOND_FAKE_PROJECT_ID]: { total: 3, failed: 3 },
    });
    mockProjectNodes(fakeTwoProposalsResp);

    const wrapper = mount(ProjectsTableTestComponent);
    await flushPromises();

    const names = () =>
      wrapper.findAll("tbody tr").map((row) => row.findAll("td")[0].text());

    expect(names()).toEqual(["fake-project", "second-project"]);

    // The column must also be sortable, otherwise the default ordering is
    // fixed and the administrator cannot re-sort it.
    const nameHeader = wrapper.findAll("thead tr")[0].findAll("th")[0];
    expect(nameHeader.attributes("data-p-sortable-column")).toBe("true");

    await nameHeader.trigger("click");
    await flushPromises();

    expect(names()).toEqual(["second-project", "fake-project"]);
  });

  test("No projects returned", async () => {
    const emptyResp: ProjectNode[] = [];
    mockProjectNodes(emptyResp);

    const wrapper = mount(ProjectsTableTestComponent);
    await flushPromises();

    expect(ProjectsTableTestComponent).toBeTruthy();
    expect(wrapper.text()).toContain("No projects found"); // H1 of the page
  });

  test("API error", async () => {
    mockProjectNodes(undefined, "error");

    const wrapper = mount(ProjectsTableTestComponent);
    await flushPromises();

    expect(ProjectsTableTestComponent).toBeTruthy();
    expect(wrapper.text()).toContain("No projects found"); // H1 of the page
  });
});
