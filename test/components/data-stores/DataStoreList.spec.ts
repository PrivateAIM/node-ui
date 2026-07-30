import { defineComponent, ref } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import DataStoreList from "~/components/data-stores/DataStoreList.vue";
import { getDataStores, getProjects } from "~/composables/useAPIFetch";
import type { ListServices } from "~/services/Api";
import type { Project } from "~/services/hub";
import { fakeDataStoreResp, fakeProjectResp } from "./constants";

vi.mock("~/composables/useAPIFetch", () => ({
  getProjects: vi.fn(),
  getAnalyses: vi.fn(),
  getDataStores: vi.fn(),
}));

describe("DataStoreList.vue", () => {
  let DataStoreListTestComponent;

  beforeEach(() => {
    vi.restoreAllMocks(); // Reset mocks before each test
  });

  // Render the component with the fake params
  beforeAll(async () => {
    DataStoreListTestComponent = defineComponent({
      components: { DataStoreList: DataStoreList },
      template: "<Suspense><DataStoreList/></Suspense>",
    });
  });

  async function checkTabs(
    datastoreData: ListServices | undefined,
    projectData: Project[] | undefined,
  ) {
    vi.mocked(getDataStores).mockResolvedValue({
      data: ref(datastoreData),
      pending: ref(false),
      error: ref(undefined),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    vi.mocked(getProjects).mockResolvedValue({
      data: ref(projectData),
      pending: ref(false),
      error: ref(undefined),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    const wrapper = mount(DataStoreListTestComponent);
    expect(wrapper).toBeTruthy();

    await flushPromises();

    expect(wrapper.text()).toContain("Data Stores");

    const detailedDataStoreTable = wrapper.find(".detailed-data-store-table");

    // Find header and all rows
    const ddstHeaderRow = detailedDataStoreTable.findAll("thead tr");
    const rows = detailedDataStoreTable.findAll("tbody tr");

    if (datastoreData && datastoreData.data) {
      expect(rows.length).toBe(datastoreData.data.length);
    } else {
      expect(rows[0].text()).toBe("No data stores found.");
    }

    // Verify header contents
    expect(ddstHeaderRow.length).toBe(1);
    const headerCols = ddstHeaderRow[0].findAll("th");
    expect(headerCols.length).toBe(11); // First col
    expect(headerCols[0].text()).toBe("Name"); // First col
    expect(headerCols[9].text()).toBe("Test Connection"); // Last col
  }

  test("All data returned", async () => {
    await checkTabs(fakeDataStoreResp, fakeProjectResp);
  });

  test("Missing data store data", async () => {
    await checkTabs(undefined, fakeProjectResp);
  });

  test("Missing project data", async () => {
    await checkTabs(fakeDataStoreResp, undefined);
  });
});
