import { defineComponent, ref } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import ContainerLogs from "~/components/analysis/logs/ContainerLogs.vue";
import { getAnalysisLogs } from "~/composables/useAPIFetch";
import { fakeAnalysisId } from "@/test/mockapi/handlers";

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
      analysis_id: fakeAnalysisId,
      run_number: 1,
      analysis_logs: [{ timestamp: "2025-01-01T00:00:00Z", message: "Starting FlameCoreSDK" }],
      nginx_logs: [],
    };
    vi.mocked(getAnalysisLogs).mockResolvedValue({
      data: ref(mockedResp),
      pending: ref(false),
      error: ref(undefined),
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
    vi.mocked(getAnalysisLogs).mockResolvedValue({
      data: ref(null),
      pending: ref(false),
      error: ref(undefined),
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
