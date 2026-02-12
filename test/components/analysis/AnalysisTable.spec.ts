import { type AsyncDataRequestStatus, useFetch, useNuxtApp } from "#app";
import { useToast } from "primevue/usetoast";
import { defineComponent } from "vue";
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
import AnalysesTable from "~/components/analysis/AnalysesTable.vue";
import {
  fakeAnalysisNodes,
  fakeProjects,
  newFakeAnalysisNode,
} from "~/test/components/analysis/constants";
import { getAnalysisNodes } from "~/composables/useAPIFetch";
import { useNodeType } from "~/composables/useNodeType";
import type { AnalysisNode } from "~/services/Api";
import { FetchError } from "ofetch";

vi.mock("~/composables/useAPIFetch", () => ({
  getAnalysisNodes: vi.fn(),
}));

vi.mock("~/composables/useNodeType", () => ({
  useNodeType: vi.fn(),
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

    vi.mocked(useNodeType).mockResolvedValue(ref("default"));

    // The basic response
    vi.mocked(getAnalysisNodes).mockResolvedValue({
      data: ref(fakeAnalysisNodes),
      pending: ref(false),
      error: ref(null),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    vi.mocked(useFetch).mockResolvedValue({
      data: ref(fakeProjects),
      pending: ref(false),
      error: ref(null),
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
    const headerCols = headerRow[0].findAll("th");
    expect(headerCols[0].text()).toBe("Name"); // First col
    expect(headerCols[9].text()).toBe("Analysis Controls"); // Last col

    // Verify the second row's content
    const secondRowCells = rows[1].findAll("td");
    expect(secondRowCells[0].text()).toBe("T006"); // Name
    expect(secondRowCells[1].text()).toBe("approved"); // Approval status
    expect(secondRowCells[7].text()).toBe("18.03.2025"); // Last Updated
  });

  test("Cached results used", async () => {
    spy.mockClear();

    const dataRef = ref(fakeAnalysisNodes);
    const errorRef = ref<FetchError | null>(null);
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
    const wrapper = mount(AnalysisTableTestComponent);
    await flushPromises();

    const rows = wrapper.findAll("tbody tr");
    expect(rows.length).toBe(3); // Ensure 3 rows exist as defined in fakeAnalysisNodes

    // "Updated" response
    fakeAnalysisNodes.push(newFakeAnalysisNode); // Add new entry to output
    vi.mocked(getAnalysisNodes).mockResolvedValue({
      data: ref(fakeAnalysisNodes),
      pending: ref(false),
      error: ref(null),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });
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
      error: ref(null),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    vi.mocked(useFetch).mockResolvedValue({
      data: ref([]),
      pending: ref(false),
      error: ref(null),
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
