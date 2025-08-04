import { defineComponent } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { vi, describe, test, expect, beforeAll, beforeEach } from "vitest";
import DataStoreListTabs from "~/components/data-stores/DataStoreListTabs.vue";
import {
  getAnalyses,
  getAnalysesFromKong,
  getDataStores,
  getProjects,
} from "~/composables/useAPIFetch";
import type { DetailedAnalysis, ListServices, Project } from "~/services/Api";
import {
  fakeAnalysisResp,
  fakeConsumerResp,
  fakeDataStoreResp,
  fakeProjectResp,
} from "~/test/components/data-stores/constants";

vi.mock("~/composables/useAPIFetch", () => ({
  getProjects: vi.fn(),
  getAnalyses: vi.fn(),
  getAnalysesFromKong: vi.fn(),
  getDataStores: vi.fn(),
}));

describe("DataStoreListTabs.vue", () => {
  let DataStoreListTabsTestComponent;

  beforeEach(() => {
    vi.restoreAllMocks(); // Reset mocks before each test

    vi.mocked(getAnalysesFromKong).mockResolvedValue({
      data: ref(fakeConsumerResp),
      pending: ref(false),
      error: ref(null),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });
  });

  // Render the component with the fake params
  beforeAll(async () => {
    DataStoreListTabsTestComponent = defineComponent({
      components: { DataStoreListTabs },
      template: "<Suspense><DataStoreListTabs/></Suspense>",
    });
  });

  async function checkTabs(
    datastoreData: ListServices | null,
    projectData: Project[] | null,
    analysisData: DetailedAnalysis[] | null,
  ) {
    vi.mocked(getDataStores).mockResolvedValue({
      data: ref(datastoreData),
      pending: ref(false),
      error: ref(null),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    vi.mocked(getProjects).mockResolvedValue({
      data: ref(projectData),
      pending: ref(false),
      error: ref(null),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    vi.mocked(getAnalyses).mockResolvedValue({
      data: ref(analysisData),
      pending: ref(false),
      error: ref(null),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    const wrapper = mount(DataStoreListTabsTestComponent);
    expect(wrapper).toBeTruthy();

    await flushPromises();

    expect(wrapper.text()).toContain("Detailed Data Store View");

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
    expect(headerCols.length).toBe(10); // First col
    expect(headerCols[0].text()).toBe("Name"); // First col
    expect(headerCols[9].text()).toBe("Delete?"); // Last col
  }

  test("All data returned", async () => {
    await checkTabs(fakeDataStoreResp, fakeProjectResp, fakeAnalysisResp);
  });

  test("Missing data store data", async () => {
    await checkTabs(null, fakeProjectResp, fakeAnalysisResp);
  });

  test("Missing analysis data", async () => {
    await checkTabs(fakeDataStoreResp, fakeProjectResp, null);
  });

  test("Missing project data", async () => {
    await checkTabs(fakeDataStoreResp, null, fakeAnalysisResp);
  });
});
