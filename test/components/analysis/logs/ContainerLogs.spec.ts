import { defineComponent } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { vi, describe, test, expect, beforeEach } from "vitest";
import ContainerLogs from "~/components/analysis/logs/ContainerLogs.vue";
import { fakeLogs } from "~/test/components/analysis/logs/constants";

// Mock useFetch
vi.mock("~/composables/useAPIFetch", () => ({
  getAnalysisLogs: vi.fn(() => ({
    data: {
      value: {
        analysis: {
          "analysis-85629f5b-da04-4f7c-84fc-097b2db93de50000": [fakeLogs],
        },
        nginx: {
          "nginx-analysis-85629f5b-da04-4f7c-84fc-097b2db93de50000": [fakeLogs],
        },
      },
    }, // Mocked API response
    pending: { value: false },
    error: { value: null },
    status: { value: "success" },
  })),
}));

describe("ContainerLogs.vue", () => {
  let wrapper;

  // Render the component with the fake params
  beforeEach(async () => {
    vi.mock("vue-router", () => ({
      useRoute: () => ({
        params: { id: "85629f5b-da04-4f7c-84fc-097b2db93de5" },
      }),
    }));
    const TestComponent = defineComponent({
      components: { ContainerLogs },
      template: "<Suspense><ContainerLogs/></Suspense>",
    });
    wrapper = mount(TestComponent, {
      global: {
        directives: {
          tooltip: {}, // Stub the tooltip directive
        },
      },
    });
    await flushPromises(); // Wait for async operations to resolve
  });

  test("Test router params", async () => {
    expect(wrapper.text()).toContain("85629f5b-da04-4f7c-84fc-097b2db93de5");
    expect(wrapper.text()).toContain("Starting FlameCoreSDK");
  });
});
