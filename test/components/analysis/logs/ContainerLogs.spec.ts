import { defineComponent, h, ref } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import { http, HttpResponse } from "msw";
import ContainerLogs from "~/components/analysis/logs/ContainerLogs.vue";
import {
  fakeAnalysisId,
  fakeAnalysisNodeId,
} from "@/test/mockapi/handlers";
import { testServer } from "@/test/mockapi/setup";

// Stub VirtualScroller to render all items in tests (no DOM dimensions needed)
const VirtualScrollerStub = defineComponent({
  name: "VirtualScroller",
  props: { items: Array },
  setup(props, { slots }) {
    return () =>
      h(
        "div",
        (props.items ?? []).map((item) =>
          slots.item ? slots.item({ item }) : null,
        ),
      );
  },
});

vi.mock("vue-router", () => ({
  useRoute: () => ({
    params: { id: fakeAnalysisId },
    query: { nodeId: fakeAnalysisNodeId },
  }),
}));

// Mock useLogChunks so tests control the chunk state without hitting MSW for logs
vi.mock("~/composables/useLogChunks", () => ({
  useLogChunks: vi.fn(),
}));

// navigateTo is a Nuxt auto-import; provide a no-op global stub for tests
globalThis.navigateTo = vi.fn();

import { useLogChunks } from "~/composables/useLogChunks";

function makeLogChunksMock(overrides: Record<string, unknown> = {}) {
  return {
    nginxLines: ref([]),
    analysisLines: ref([]),
    oldestTimestamp: ref(null),
    hasOlder: ref(false),
    isLoading: ref(false),
    initialized: ref(true),
    httpError: ref(null),
    runNumber: ref(1),
    initialize: vi.fn().mockResolvedValue(undefined),
    loadOlderChunk: vi.fn().mockResolvedValue(undefined),
    appendPolled: vi.fn(),
    reset: vi.fn(),
    ...overrides,
  };
}

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
    const mockChunks = makeLogChunksMock({
      nginxLines: ref([]),
      analysisLines: ref([
        {
          content: "Starting FlameCoreSDK",
          level: "INFO",
          timestamp: "2025-01-01T00:00:00Z",
          isStacktrace: false,
        },
      ]),
      initialized: ref(true),
      runNumber: ref(1),
    });
    vi.mocked(useLogChunks).mockReturnValue(mockChunks);

    wrapper = mount(LogTestComponent, {
      global: { stubs: { VirtualScroller: VirtualScrollerStub } },
    });
    await flushPromises();

    expect(LogTestComponent).toBeTruthy();
    expect(wrapper.text()).toContain("Starting FlameCoreSDK");
    expect(wrapper.find("#refreshBtn").attributes("data-p-disabled")).toBe(
      "false",
    );
  });

  test("Empty analysis logs", async () => {
    testServer.use(
      http.get(`/analysis-nodes/${fakeAnalysisNodeId}`, () =>
        new HttpResponse(null, { status: 404 }),
      ),
    );

    const mockChunks = makeLogChunksMock({
      nginxLines: ref([]),
      analysisLines: ref([]),
      initialized: ref(true),
      runNumber: ref(null),
    });
    vi.mocked(useLogChunks).mockReturnValue(mockChunks);

    wrapper = mount(LogTestComponent, {
      global: { stubs: { VirtualScroller: VirtualScrollerStub } },
    });
    await flushPromises();

    expect(LogTestComponent).toBeTruthy();
    expect(wrapper.text()).toContain(fakeAnalysisId);
    expect(wrapper.text()).toContain("No logs found...");
    expect(wrapper.find("#refreshBtn").attributes("data-p-disabled")).toBe(
      "true",
    );
  });
});
