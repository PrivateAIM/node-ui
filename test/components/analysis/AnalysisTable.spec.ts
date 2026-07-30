import { type AsyncDataRequestStatus, useFetch, useNuxtApp } from "nuxt/app";
import { computed, defineComponent, ref } from "vue";
import { useToast } from "primevue/usetoast";
import { flushPromises, mount } from "@vue/test-utils";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import { http, HttpResponse } from "msw";
import AnalysesTable from "~/components/analysis/AnalysesTable.vue";
import AnalysisControlButtons from "~/components/analysis/AnalysisControlButtons.vue";
import {
  fakeAnalysisNodes,
  fakeBaseAnalysisNode,
  newFakeAnalysisNode,
} from "./constants";
import { getAnalysisNodes } from "~/composables/useAPIFetch";
import { useDatastoreRequirement } from "~/composables/useDatastoreRequirement";
import { PodStatus } from "~/services/Api";
import { type AnalysisNode, ProcessStatus } from "~/services/hub";
import { testServer } from "@/test/mockapi/setup";
import { fakeAnalysisId } from "@/test/mockapi/handlers";

vi.mock("~/composables/useAPIFetch", () => ({
  getAnalysisNodes: vi.fn(),
}));

vi.mock("~/composables/useDatastoreRequirement", () => ({
  useDatastoreRequirement: vi.fn(),
}));

describe("AnalysesTable.vue", () => {
  let spy;
  let mockToast;
  let AnalysisTableTestComponent;

  // Render the component with the fake params
  beforeAll(async () => {
    AnalysisTableTestComponent = defineComponent({
      components: { AnalysesTable },
      template: "<Suspense><AnalysesTable/></Suspense>",
    });
  });

  beforeEach(() => {
    mockToast = { add: vi.fn() };
    vi.mocked(useToast).mockReturnValue(mockToast);
    spy = vi.spyOn(mockToast, "add");

    vi.mocked(useDatastoreRequirement).mockReturnValue({
      nodeType: computed(() => "default"),
      requireDataStore: computed(() => true),
    });

    // The basic response
    vi.mocked(getAnalysisNodes).mockResolvedValue({
      data: ref(fakeAnalysisNodes),
      pending: ref(false),
      error: ref(undefined),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    vi.mocked(useNuxtApp);
  });

  afterEach(() => {
    spy.mockReset();
  });

  test("Return analysis node data", async () => {
    const wrapper = mount(AnalysisTableTestComponent);
    await flushPromises();

    expect(AnalysisTableTestComponent).toBeTruthy();
    expect(wrapper.text()).toContain("Analyses"); // H1 of the page

    // Find header and all rows
    const headerRow = wrapper.findAll("thead tr");
    const rows = wrapper.findAll("tbody tr");
    expect(rows.length).toBe(3); // Ensure 3 rows exist as defined in fakeAnalysisNodes

    // Verify header contents
    expect(headerRow.length).toBe(1);
    const headerCols = headerRow[0]!.findAll("th");
    expect(headerCols[0]!.text()).toBe("Name"); // First col
    expect(headerCols[1]!.text()).toBe("Hub Statuses"); // Combined statuses col
    expect(headerCols[8]!.text()).toBe("Analysis Controls"); // Last col

    // Verify the second row's content
    const secondRowCells = rows[1]!.findAll("td");
    expect(secondRowCells[0]!.text()).toBe("T006"); // Name
    // Hub Statuses cell combines approval/build/distribution onto three lines
    expect(secondRowCells[1]!.text()).toContain("approved"); // Approval status
    expect(secondRowCells[6]!.text()).toBe("18.03.2025"); // Last Updated
  });

  test("Cached results used", async () => {
    spy.mockClear();

    const dataRef = ref(fakeAnalysisNodes);
    const errorRef = ref<
      { statusCode: number; name: string; message: string } | undefined
    >(undefined);
    const statusRef = ref<AsyncDataRequestStatus>("success");
    const mockRefresh = vi.fn();

    // Return results so they are cached
    vi.mocked(getAnalysisNodes).mockResolvedValueOnce({
      data: dataRef,
      pending: ref(false),
      error: errorRef,
      status: statusRef,
      refresh: mockRefresh,
      execute: vi.fn(),
      clear: vi.fn(),
    });

    const wrapper = mount(AnalysisTableTestComponent);
    await flushPromises();

    const rows = wrapper.findAll("tbody tr");
    expect(rows.length).toBe(3); // Ensure 3 rows exist as defined in fakeAnalysisNodes

    // Return empty but expect cached results
    // Simulate refresh returning an error
    mockRefresh.mockImplementation(async () => {
      errorRef.value = { statusCode: 500, name: "Hub", message: "" };
      statusRef.value = "error";
      dataRef.value = fakeAnalysisNodes; // Keep cached data
    });

    await wrapper.find(".table-refresh-btn").trigger("click");
    await flushPromises();

    const cachedRows = wrapper.findAll("tbody tr");
    expect(cachedRows.length).toBe(3); // Ensure 3 rows exist as defined in fakeAnalysisNode

    expect(spy).toHaveBeenCalledWith({
      severity: "warn",
      summary: "Unable to refresh the table",
      detail: "The Hub is unreachable and the table could not be updated",
      life: 5000,
    });
  });

  test("Refresh table", async () => {
    const dataRef = ref([...fakeAnalysisNodes]);
    const mockRefresh = vi.fn(async () => {
      dataRef.value = [...fakeAnalysisNodes, newFakeAnalysisNode];
    });
    vi.mocked(getAnalysisNodes).mockResolvedValueOnce({
      data: dataRef,
      pending: ref(false),
      error: ref(undefined),
      status: ref("success"),
      refresh: mockRefresh,
      execute: vi.fn(),
      clear: vi.fn(),
    });

    const wrapper = mount(AnalysisTableTestComponent);
    await flushPromises();

    expect(wrapper.findAll("tbody tr").length).toBe(3);

    const refreshButton = wrapper.find(".table-refresh-btn");
    await refreshButton.trigger("click");
    await flushPromises();

    expect(wrapper.findAll("tbody tr").length).toBe(4); // Should be one entry bigger
  });

  test("No analyses returned", async () => {
    const emptyResp: AnalysisNode[] = [];
    vi.mocked(getAnalysisNodes).mockResolvedValue({
      data: ref(emptyResp),
      pending: ref(false),
      error: ref(undefined),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    vi.mocked(useFetch).mockResolvedValue({
      data: ref([]),
      pending: ref(false),
      error: ref(undefined),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    const wrapper = mount(AnalysisTableTestComponent);
    await flushPromises();

    expect(AnalysisTableTestComponent).toBeTruthy();
    expect(wrapper.text()).toContain("No analyses found"); // H1 of the page
  });
});

// ProgressBar stub used across progress tests — captures mode, value, and style as data attributes
const ProgressBarStub = {
  props: ["mode", "value", "style"],
  template:
    '<div class="mock-progress-bar" :data-mode="mode ?? \'determinate\'" :data-value="String(value ?? 0)" />',
};

// Helper: mock getAnalysisNodes for a single test
function mockNodes(nodes: AnalysisNode[]) {
  vi.mocked(getAnalysisNodes).mockResolvedValueOnce({
    data: ref(nodes),
    pending: ref(false),
    error: ref(undefined),
    status: ref("success"),
    refresh: vi.fn(),
    execute: vi.fn(),
    clear: vi.fn(),
  });
}

describe("AnalysesTable.vue - PO calls and Progress", () => {
  let AnalysisTableTestComponent;

  beforeAll(() => {
    AnalysisTableTestComponent = defineComponent({
      components: { AnalysesTable },
      template: "<Suspense><AnalysesTable/></Suspense>",
    });
  });

  beforeEach(() => {
    vi.mocked(useToast).mockReturnValue({
      add: vi.fn(),
    } as unknown as ReturnType<typeof useToast>);
    vi.mocked(useDatastoreRequirement).mockReturnValue({
      nodeType: computed(() => "default"),
      requireDataStore: computed(() => true),
    });
    // Default: three nodes so existing table tests keep working
    vi.mocked(getAnalysisNodes).mockResolvedValue({
      data: ref(fakeAnalysisNodes),
      pending: ref(false),
      error: ref(undefined),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });
  });

  // Column index of the Progress cell in each DataTable row
  // (0=Name, 1=HubStatuses, 2=RunStatus, 3=Project, 4=DataStore, 5=Created, 6=LastUpdated, 7=Progress, 8=Controls)
  const PROGRESS_COL = 7;
  // Column index of the Run Status cell
  const RUN_STATUS_COL = 2;

  test("Progress bar is indeterminate when executing and progress is 0", async () => {
    // fakeBaseAnalysisNode.analysisId matches fakeAnalysisId, so PodOrc
    // reports it as "executing", Hub executionProgress is 0 -> indeterminate.
    mockNodes([
      {
        ...fakeBaseAnalysisNode,
        executionStatus: ProcessStatus.STARTED,
        executionProgress: 0,
      },
    ]);

    const wrapper = mount(AnalysisTableTestComponent, {
      global: { stubs: { ProgressBar: ProgressBarStub } },
    });
    await flushPromises();

    const progressBar = wrapper
      .findAll("tbody tr")[0]!
      .findAll("td")
      [PROGRESS_COL]!.find(".mock-progress-bar");

    expect(progressBar.attributes("data-mode")).toBe("indeterminate");
  });

  test("Progress bar is determinate when executing and progress is non-zero", async () => {
    // Same analysisId as fakeAnalysisId — PodOrc sets executionStatus to
    // "executing". Hub has executionProgress: 50, which is preserved.
    mockNodes([
      {
        ...fakeBaseAnalysisNode,
        executionStatus: ProcessStatus.STARTED,
        executionProgress: 50,
      },
    ]);

    const wrapper = mount(AnalysisTableTestComponent, {
      global: { stubs: { ProgressBar: ProgressBarStub } },
    });
    await flushPromises();

    const progressBar = wrapper
      .findAll("tbody tr")[0]!
      .findAll("td")
      [PROGRESS_COL]!.find(".mock-progress-bar");

    expect(progressBar.attributes("data-mode")).toBe("determinate");
    expect(progressBar.attributes("data-value")).toBe("50");
  });

  test("setProgress sets executionProgress to 100 for executed status", async () => {
    // Unique ID not known to PodOrc. "executed" is terminal so parseAnalysis
    // keeps it. setProgress then forces executionProgress to 100.
    const executedNode: AnalysisNode = {
      ...fakeBaseAnalysisNode,
      analysisId: "aaaaaaaa-0000-0000-0000-000000000001",
      executionStatus: ProcessStatus.EXECUTED,
      executionProgress: 0,
    };
    mockNodes([executedNode]);

    const wrapper = mount(AnalysisTableTestComponent, {
      global: { stubs: { ProgressBar: ProgressBarStub } },
    });
    await flushPromises();

    const progressBar = wrapper
      .findAll("tbody tr")[0]!
      .findAll("td")
      [PROGRESS_COL]!.find(".mock-progress-bar");

    expect(progressBar.attributes("data-value")).toBe("100");
  });

  test("setProgress resets executionProgress to 0 for failed status", async () => {
    // Hub reports 60% progress, but setProgress should zero it out for failed.
    const failedNode: AnalysisNode = {
      ...fakeBaseAnalysisNode,
      analysisId: "aaaaaaaa-0000-0000-0000-000000000002",
      executionStatus: ProcessStatus.FAILED,
      executionProgress: 60,
    };
    mockNodes([failedNode]);

    const wrapper = mount(AnalysisTableTestComponent, {
      global: { stubs: { ProgressBar: ProgressBarStub } },
    });
    await flushPromises();

    const progressBar = wrapper
      .findAll("tbody tr")[0]!
      .findAll("td")
      [PROGRESS_COL]!.find(".mock-progress-bar");

    expect(progressBar.attributes("data-value")).toBe("0");
  });

  test("PodOrc executionStatus overrides hub executionStatus in Run Status column", async () => {
    // Hub says "started"; PodOrc handler returns { status: "executing" } for the
    // same analysisId → parseAnalysis should use the PodOrc value.
    mockNodes([
      {
        ...fakeBaseAnalysisNode,
        executionStatus: ProcessStatus.STARTED,
        executionProgress: 0,
      },
    ]);

    const wrapper = mount(AnalysisTableTestComponent);
    await flushPromises();

    const runStatusCell = wrapper.findAll("tbody tr")[0]!.findAll("td")[
      RUN_STATUS_COL
    ]!;
    expect(runStatusCell.text()).toBe(PodStatus.Executing);
  });

  test("Non-terminal executionStatus is cleared when analysis is absent from PodOrc", async () => {
    // Override PodOrc to return an empty response so no analysis ID matches.
    // "started" is non-terminal → parseAnalysis nulls it → no Tag rendered.
    testServer.use(http.get("/po/status", () => HttpResponse.json({})));

    mockNodes([
      {
        ...fakeBaseAnalysisNode,
        executionStatus: ProcessStatus.STARTED,
        executionProgress: 0,
      },
    ]);

    const wrapper = mount(AnalysisTableTestComponent);
    await flushPromises();

    const runStatusCell = wrapper.findAll("tbody tr")[0]!.findAll("td")[
      RUN_STATUS_COL
    ]!;
    expect(runStatusCell.text()).toBe("");
  });

  test("Terminal executionStatus is preserved when analysis is absent from PodOrc", async () => {
    // Unique ID not in PodOrc response. "executed" is terminal → parseAnalysis
    // preserves it → Tag is rendered.
    testServer.use(http.get("/po/status", () => HttpResponse.json({})));

    const executedNode: AnalysisNode = {
      ...fakeBaseAnalysisNode,
      analysisId: "aaaaaaaa-0000-0000-0000-000000000003",
      executionStatus: ProcessStatus.EXECUTED,
      executionProgress: 0,
    };
    mockNodes([executedNode]);

    const wrapper = mount(AnalysisTableTestComponent);
    await flushPromises();

    const runStatusCell = wrapper.findAll("tbody tr")[0]!.findAll("td")[
      RUN_STATUS_COL
    ]!;
    expect(runStatusCell.text()).toBe(PodStatus.Executed);
  });

  test("updateAnalysisRun updates the progress bar when the control buttons emit updateAnalysisRow", async () => {
    // Start with fakeBaseAnalysisNode; PodOrc makes it "executing" with 0 progress → indeterminate
    mockNodes([
      {
        ...fakeBaseAnalysisNode,
        executionStatus: ProcessStatus.STARTED,
        executionProgress: 0,
      },
    ]);

    const wrapper = mount(AnalysisTableTestComponent, {
      global: { stubs: { ProgressBar: ProgressBarStub } },
    });
    await flushPromises();

    const progressBarBefore = wrapper.find(".mock-progress-bar");
    expect(progressBarBefore.attributes("data-mode")).toBe("indeterminate");

    // Simulate AnalysisControlButtons emitting updateAnalysisRow with "executed".
    // setProgress will force executionProgress to 100.
    const controlButtons = wrapper.findComponent(AnalysisControlButtons);
    controlButtons.vm.$emit("updateAnalysisRow", fakeAnalysisId, {
      status: PodStatus.Executed,
    });
    await flushPromises();

    const progressBarAfter = wrapper.find(".mock-progress-bar");
    expect(progressBarAfter.attributes("data-mode")).toBe("determinate");
    expect(progressBarAfter.attributes("data-value")).toBe("100");
  });
});
