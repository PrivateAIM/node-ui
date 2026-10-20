import { defineComponent, ref } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import DataStoresPage from "~/pages/data-stores/index.vue";
import { getDataStores, getProjects } from "~/composables/useAPIFetch";
import type { ListServices, Project } from "~/services/Api";
import { fakeDataStoreResp, fakeProjectResp } from "../components/data-stores/constants";

vi.mock("~/composables/useAPIFetch", () => ({
  getProjects: vi.fn(),
  getDataStores: vi.fn(),
}));

describe("pages/data-stores/index.vue", () => {
  let DataStoresPageTestComponent;

  beforeEach(() => {
    vi.restoreAllMocks(); // Reset mocks before each test
  });

  // Render the component with the fake params
  beforeAll(async () => {
    DataStoresPageTestComponent = defineComponent({
      components: { DataStoresPage },
      template: "<Suspense><DataStoresPage/></Suspense>",
    });
  });

  async function checkTabs(
    datastoreData: ListServices | undefined,
    projectData: Project[] | undefined,
  ) {
    vi.mocked(getDataStores).mockReturnValue({
      data: ref(datastoreData),
      pending: ref(false),
      error: ref(undefined),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    vi.mocked(getProjects).mockReturnValue({
      data: ref(projectData),
      pending: ref(false),
      error: ref(undefined),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    const wrapper = mount(DataStoresPageTestComponent);
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
