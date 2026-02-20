import { type AsyncDataRequestStatus, useFetch, useNuxtApp } from "nuxt/app";
import { useToast } from "primevue/usetoast";
import { defineComponent, ref } from "vue";
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
import { fakeAnalysisNodes, newFakeAnalysisNode } from "./constants";
import { getAnalysisNodes } from "~/composables/useAPIFetch";
import { useDatastoreRequirement } from "~/composables/useDatastoreRequirement";
import type { AnalysisNode } from "~/services/Api";

vi.mock("~/composables/useAPIFetch", () => ({
  getAnalysisNodes: vi.fn(),
}));

vi.mock("~/composables/useNodeType", () => ({
  useNodeType: vi.fn(),
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

    vi.mocked(useDatastoreRequirement).mockResolvedValue({
      datastoreState: ref({
        datastoreRequired: true,
        nodeType: "default",
      }),
      setDatastoreRequired: vi.fn(),
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
    expect(headerCols[9]!.text()).toBe("Analysis Controls"); // Last col

    // Verify the second row's content
    const secondRowCells = rows[1]!.findAll("td");
    expect(secondRowCells[0]!.text()).toBe("T004"); // Name
    expect(secondRowCells[1]!.text()).toBe("approved"); // Approval status
    expect(secondRowCells[7]!.text()).toBe("14.03.2025"); // Last Updated
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
    const wrapper = mount(AnalysisTableTestComponent);
    await flushPromises();

    const rows = wrapper.findAll("tbody tr");
    expect(rows.length).toBe(3); // Ensure 3 rows exist as defined in fakeAnalysisNodes

    // "Updated" response
    fakeAnalysisNodes.push(newFakeAnalysisNode); // Add new entry to output
    vi.mocked(getAnalysisNodes).mockResolvedValue({
      data: ref(fakeAnalysisNodes),
      pending: ref(false),
      error: ref(undefined),
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
