import { useToast } from "primevue/usetoast";
import { computed, defineComponent } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import ProjectsTable from "~/components/projects/ProjectsTable.vue";
import { getProjectNodes } from "~/composables/useAPIFetch";
import { useDatastoreRequirement } from "~/composables/useDatastoreRequirement";
import { useProjectAnalysisSummary } from "~/composables/useProjectAnalysisSummary";
import { emptyProjectAnalysisSummary } from "~/utils/summarise-project-analyses";
import type { ProjectAnalysisSummary } from "~/utils/summarise-project-analyses";
import type { ProjectNode } from "~/services/Api";
import { fakeProposalsResp } from "@/test/components/projects/constants";

vi.mock("~/composables/useAPIFetch", () => ({
  getProjectNodes: vi.fn(),
}));

vi.mock("~/composables/useDatastoreRequirement", () => ({
  useDatastoreRequirement: vi.fn(),
}));

vi.mock("~/composables/useProjectAnalysisSummary", () => ({
  useProjectAnalysisSummary: vi.fn(),
}));

const FAKE_PROJECT_ID = "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483";

function mockSummary(overrides: Partial<ProjectAnalysisSummary> = {}) {
  const summary = { ...emptyProjectAnalysisSummary(true), ...overrides };
  vi.mocked(useProjectAnalysisSummary).mockReturnValue({
    summaries: ref(new Map([[FAKE_PROJECT_ID, summary]])),
    dataStoreProjectIds: ref(new Set([FAKE_PROJECT_ID])),
    loading: ref(false),
    refreshSummaries: vi.fn(),
    // Id-aware on purpose: a mock that ignored its argument would pass even if
    // the component looked the summary up by the wrong id (row.id, node_id...).
    summaryFor: (id: string | undefined | null) =>
      id === FAKE_PROJECT_ID ? summary : emptyProjectAnalysisSummary(false),
  } as never);
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
    vi.mocked(getProjectNodes).mockResolvedValue({
      data: ref(fakeProposalsResp),
      pending: ref(false),
      error: ref(undefined),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

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
    expect(headerCols[2].text()).toBe("Number of Nodes");
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
    vi.mocked(getProjectNodes).mockResolvedValue({
      data: ref(fakeProposalsResp),
      pending: ref(false),
      error: ref(undefined),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    const wrapper = mount(ProjectsTableTestComponent);
    await flushPromises();

    const dataStoreCell = wrapper.findAll("tbody tr")[0].findAll("td")[4];
    expect(dataStoreCell.find(".pi-check").exists()).toBe(true);
    expect(dataStoreCell.find("a").exists()).toBe(false);
  });

  test("Links a project with no data store to data store creation", async () => {
    mockSummary({ total: 2, waiting: 2, hasDataStore: false });
    vi.mocked(getProjectNodes).mockResolvedValue({
      data: ref(fakeProposalsResp),
      pending: ref(false),
      error: ref(undefined),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    const wrapper = mount(ProjectsTableTestComponent);
    await flushPromises();

    const dataStoreCell = wrapper.findAll("tbody tr")[0].findAll("td")[4];
    expect(dataStoreCell.find(".pi-times").exists()).toBe(true);
    expect(dataStoreCell.find("button").attributes("aria-label")).toContain(
      "create a data store",
    );
  });

  test("Renders the status tag and one meter segment per non-empty bucket", async () => {
    mockSummary({ total: 6, executed: 3, failed: 2, idle: 1 });
    vi.mocked(getProjectNodes).mockResolvedValue({
      data: ref(fakeProposalsResp),
      pending: ref(false),
      error: ref(undefined),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    const wrapper = mount(ProjectsTableTestComponent);
    await flushPromises();

    const statusCell = wrapper.findAll("tbody tr")[0].findAll("td")[3];
    expect(statusCell.text()).toContain("2 failed");

    const segments = statusCell.findAll(".status-meter-seg");
    expect(segments.length).toBe(3); // executed, failed, idle — not the empty buckets
    expect(segments[0].classes()).toContain("status-meter-executed");
    expect(segments[1].classes()).toContain("status-meter-failed");
    expect(segments[2].classes()).toContain("status-meter-idle");
  });

  test("Renders no meter when the project has no analyses on this node", async () => {
    mockSummary({ total: 0 });
    vi.mocked(getProjectNodes).mockResolvedValue({
      data: ref(fakeProposalsResp),
      pending: ref(false),
      error: ref(undefined),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    const wrapper = mount(ProjectsTableTestComponent);
    await flushPromises();

    const statusCell = wrapper.findAll("tbody tr")[0].findAll("td")[3];
    expect(statusCell.text()).toContain("No analyses");
    expect(statusCell.findAll(".status-meter-seg").length).toBe(0);
  });

  test("Renders the legend once, above the table", async () => {
    mockSummary({ total: 3, executed: 3 });
    vi.mocked(getProjectNodes).mockResolvedValue({
      data: ref(fakeProposalsResp),
      pending: ref(false),
      error: ref(undefined),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    const wrapper = mount(ProjectsTableTestComponent);
    await flushPromises();

    expect(wrapper.findAll(".status-legend").length).toBe(1);
  });

  test("No projects returned", async () => {
    const emptyResp: ProjectNode[] = [];
    vi.mocked(getProjectNodes).mockResolvedValue({
      data: ref(emptyResp),
      pending: ref(false),
      error: ref(undefined),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    const wrapper = mount(ProjectsTableTestComponent);
    await flushPromises();

    expect(ProjectsTableTestComponent).toBeTruthy();
    expect(wrapper.text()).toContain("No projects found"); // H1 of the page
  });

  test("API error", async () => {
    vi.mocked(getProjectNodes).mockResolvedValue({
      data: ref(undefined),
      pending: ref(false),
      error: ref(undefined),
      status: ref("error"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    const wrapper = mount(ProjectsTableTestComponent);
    await flushPromises();

    expect(ProjectsTableTestComponent).toBeTruthy();
    expect(wrapper.text()).toContain("No projects found"); // H1 of the page
  });
});
