import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import { mount, flushPromises } from "@vue/test-utils";
import { vi, describe, it, expect, beforeAll } from "vitest";
import { fakeDetailedAnalysisTableProps } from "~/test/components/data-stores/constants";
import DetailedAnalysisTable from "~/components/data-stores/tables/DetailedAnalysisTable.vue";

vi.mock("primevue/useconfirm", () => ({
  useConfirm: vi.fn(() => ({
    require: vi.fn(),
  })),
}));

describe("DetailedAnalysisTable.vue", () => {
  let mockToast;
  let mockConfirm;

  beforeAll(() => {
    mockConfirm = { require: vi.fn() };
    vi.mocked(useToast).mockReturnValue(mockToast);
    vi.mocked(useConfirm).mockReturnValue(mockConfirm);
  });

  it("Return detailed consumer data", async () => {
    const wrapper = mount(DetailedAnalysisTable, {
      props: fakeDetailedAnalysisTableProps,
    });

    await flushPromises(); // Allows onMounted to render

    expect(wrapper).toBeTruthy();
    expect(wrapper.text()).toContain("Analysis"); // H1 of the page

    // Find header and all rows
    const headerRow = wrapper.findAll("thead tr");
    const rows = wrapper.findAll("tbody tr");
    expect(rows.length).toBe(1); // Should only have one row

    // Verify header contents
    expect(headerRow.length).toBe(1);
    const headerCols = headerRow[0].findAll("th");
    expect(headerCols[0].text()).toBe("Analysis"); // First col
    expect(headerCols[1].text()).toBe("Analysis UUID");

    // Get analysis row and check contents
    const analysisRow = rows[0]; // Only row at level 3
    const analysisRowCells = analysisRow.findAll("td");
    expect(analysisRowCells[0].text()).toBe("ds-analysis-test");
    expect(analysisRowCells[2].text()).toBe(
      "8003eefe-e39b-4bd4-aec4-78046c63b39b-flame",
    ); // Consumer name
    expect(analysisRowCells[3].text()).toBe("ds-project-test");
  });

  it("No data stores returned", async () => {
    const wrapper = mount(DetailedAnalysisTable, {
      props: {
        detailedAnalysisList: [],
        analysisNameMap: new Map<string, string>([]),
        projectNameMap: new Map<string, string>([]),
      },
    });
    await flushPromises();

    expect(wrapper).toBeTruthy();
    expect(wrapper.text()).toContain("No associated linked analyses found"); // H1 of the page
  });

  it("Popup and toast function", async () => {
    const wrapper = mount(DetailedAnalysisTable, {
      props: fakeDetailedAnalysisTableProps,
      attachTo: document.body,
      global: {
        stubs: {
          teleport: true, // Now dropdowns are included/teleported in root element
        },
      },
    });
    const confirmSpy = vi.spyOn(mockConfirm, "require");

    await flushPromises(); // Allows onMounted to render

    const deleteBtn = wrapper.find(".detailed-consumers-table button");
    await deleteBtn.trigger("click");

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    // TODO: figure out how to check confirm popup and button functionalities
    const cancelBtn = wrapper.find('button[aria-label="Cancel"]');
    console.log(wrapper.find(".delete-confirm-box"));
    // console.log(cancelBtn.attributes());
    // await cancelBtn.trigger("click");
    // expect(wrapper.find(".delete-confirm-box")).toBeFalsy();
  });
});
