import { useFetch, useNuxtApp } from "#app";
import { useToast } from "primevue/usetoast";
import { defineComponent } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import AnalysesTable from "~/components/analysis/AnalysesTable.vue";
import {
  fakeAnalysisNodes,
  fakeProjects,
  newFakeAnalysisNode,
} from "~/test/components/analysis/constants";
import { getAnalysisNodes } from "~/composables/useAPIFetch";
import type { AnalysisNode } from "~/services/Api";

vi.mock("~/composables/useAPIFetch", () => ({
  getAnalysisNodes: vi.fn(),
}));

describe("AnalysesTable.vue", () => {
  let mockToast;
  let AnalysisTableTestComponent;

  beforeEach(() => {
    vi.mocked(useToast).mockReturnValue(mockToast);
    vi.restoreAllMocks(); // Reset mocks before each test

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

  // Render the component with the fake params
  beforeAll(async () => {
    AnalysisTableTestComponent = defineComponent({
      components: { AnalysesTable },
      template: "<Suspense><AnalysesTable/></Suspense>",
    });
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
    expect(secondRowCells[0].text()).toBe("T004"); // Name
    expect(secondRowCells[1].text()).toBe("approved"); // Approval status
    expect(secondRowCells[7].text()).toBe("14.03.2025"); // Last Updated
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
