import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import DataStoreTreeTable from "~/components/data-stores/tables/DataStoreTreeTable.vue";
import { fakeDatastoreTreeTableProps } from "~/test/components/data-stores/constants";

describe("DataStoreTreeTable.vue", () => {
  it("Return analysis node data", async () => {
    const wrapper = mount(DataStoreTreeTable, {
      // @ts-expect-error Complaining about types that are properly defined
      props: fakeDatastoreTreeTableProps,
    });

    await flushPromises(); // Allows onMounted to render

    expect(wrapper).toBeTruthy();
    expect(wrapper.text()).toContain("DataStore"); // H1 of the page

    // Find header and all rows
    const headerRow = wrapper.findAll("thead tr");
    const rows = wrapper.findAll("tbody tr");
    expect(rows.length).toBe(1); // Should only have one row

    // Verify header contents
    expect(headerRow.length).toBe(1);
    const headerCols = headerRow[0].findAll("th");
    expect(headerCols[0].text()).toBe("Name"); // First col
    expect(headerCols[1].text()).toBe("UUID"); // Last col

    // Verify button works
    const dataStoreBtn = rows[0].find("button");
    await dataStoreBtn.trigger("click");
    expect(wrapper.findAll("tbody tr").length).toBe(2); // Expand one row

    // Get project row and check contents
    const projRow = wrapper.find('tr[aria-level="2"]'); // Only row at level 2
    const projRowCells = projRow.findAll("td");
    expect(projRowCells[0].text()).toBe("ds-project-test");
    expect(projRowCells[2].text()).toBe("Project");

    const projBtn = projRow.find("button");
    await projBtn.trigger("click");
    expect(wrapper.findAll("tbody tr").length).toBe(3); // Expand one row

    // Get analysis row and check contents
    const analysisRow = wrapper.find('tr[aria-level="3"]'); // Only row at level 3
    const analysisRowCells = analysisRow.findAll("td");
    expect(analysisRowCells[0].text()).toBe("ds-analysis-test");
    expect(analysisRowCells[2].text()).toBe("Analysis");
  });

  it("No data stores returned", async () => {
    const wrapper = mount(DataStoreTreeTable, {
      props: {
        dataStoreList: [],
        analyses: [],
        analysisNameMap: new Map<string, string>([]),
        projectNameMap: new Map<string, string>([]),
      },
    });
    await flushPromises();

    expect(wrapper).toBeTruthy();
    expect(wrapper.text()).toContain("No local nodes found"); // H1 of the page
  });
});
