import { ref } from "vue";
import { defineComponent } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { vi, describe, test, expect, beforeAll, beforeEach } from "vitest";
import ContainerLogs from "~/components/analysis/logs/ContainerLogs.vue";
import { fakeLogs } from "~/test/components/analysis/logs/constants";
import { getAnalysisLogs } from "~/composables/useAPIFetch";

vi.mock("vue-router", () => ({
  useRoute: () => ({
    params: { id: "85629f5b-da04-4f7c-84fc-097b2db93de5" },
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
        "analysis-85629f5b-da04-4f7c-84fc-097b2db93de50000": [fakeLogs],
      },
      nginx: {
        "nginx-analysis-85629f5b-da04-4f7c-84fc-097b2db93de50000": [fakeLogs],
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

    wrapper = mount(LogTestComponent, {
      global: {
        directives: {
          tooltip: {}, // Stub the tooltip directive
        },
      },
    });
    await flushPromises();
    expect(LogTestComponent).toBeTruthy();
    expect(wrapper.text()).toContain("Starting FlameCoreSDK");
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
    wrapper = mount(LogTestComponent, {
      global: {
        directives: {
          tooltip: {}, // Stub the tooltip directive
        },
      },
    });
    await flushPromises();
    expect(LogTestComponent).toBeTruthy();
    expect(wrapper.text()).toContain("85629f5b-da04-4f7c-84fc-097b2db93de5");
    expect(wrapper.text()).toContain("No logs found...");
  });
});
