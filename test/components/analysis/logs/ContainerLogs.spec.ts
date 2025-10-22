import { defineComponent } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import ContainerLogs from "~/components/analysis/logs/ContainerLogs.vue";
import { fakeLogs } from "~/test/components/analysis/constants";
import { getAnalysisLogs } from "~/composables/useAPIFetch";
import { fakeAnalysisId } from "~/test/mockapi/handlers";

vi.mock("vue-router", () => ({
  useRoute: () => ({
    params: { id: fakeAnalysisId },
  }),
}));

vi.mock("~/composables/useAPIFetch", () => ({
  getAnalysisLogs: vi.fn(),
}));

describe("ContainerLogs.vue", () => {
  let wrapper;
  let LogTestComponent;

  beforeEach(() => {
    vi.restoreAllMocks(); // Reset mocks before each test
  });

  // Render the component with the fake params
  beforeAll(async () => {
    LogTestComponent = defineComponent({
      components: { ContainerLogs },
      template: "<Suspense><ContainerLogs/></Suspense>",
    });
  });

  test("Parse returned analysis logs", async () => {
    const mockedResp = {
      analysis: {
        [fakeAnalysisId]: [fakeLogs],
      },
      nginx: {
        [fakeAnalysisId]: [fakeLogs],
      },
    };
    vi.mocked(getAnalysisLogs).mockResolvedValue({
      data: ref(mockedResp),
      pending: ref(false),
      error: ref(null),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    wrapper = mount(LogTestComponent);
    await flushPromises();

    expect(LogTestComponent).toBeTruthy();
    expect(wrapper.text()).toContain("Starting FlameCoreSDK");
    expect(wrapper.find("#refreshBtn").attributes("data-p-disabled")).toBe(
      "false",
    );
  });

  test("Empty analysis logs", async () => {
    // Mock useFetch
    const emptyResp = { analysis: {}, nginx: {} };
    vi.mocked(getAnalysisLogs).mockResolvedValue({
      data: ref(emptyResp),
      pending: ref(false),
      error: ref(null),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    wrapper = mount(LogTestComponent);
    await flushPromises();

    expect(LogTestComponent).toBeTruthy();
    expect(wrapper.text()).toContain(fakeAnalysisId);
    expect(wrapper.text()).toContain("No logs found...");
    expect(wrapper.find("#refreshBtn").attributes("data-p-disabled")).toBe(
      "true",
    );
  });
});
