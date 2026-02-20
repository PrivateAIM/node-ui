import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import EventViewer from "~/components/events/EventViewer.vue";
import { type DefineComponent, defineComponent, ref } from "vue";
import { fakeEventResponse } from "@/test/components/events/constants";
import { getEvents } from "~/composables/useAPIFetch";
import type { EventLogResponse } from "~/services/Api";

vi.mock("~/composables/useAPIFetch", () => ({
  getEvents: vi.fn(),
}));

describe("EventViewer.vue", () => {
  let EventViewerComponent: DefineComponent<typeof EventViewer>;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // Render the component with the fake params
  beforeAll(async () => {
    EventViewerComponent = defineComponent({
      components: { EventViewer },
      template: "<Suspense><EventViewer/></Suspense>",
    });
  });

  it("Loads events into table", async () => {
    vi.mocked(getEvents).mockResolvedValue({
      data: ref(fakeEventResponse),
      pending: ref(false),
      error: ref(undefined),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    const wrapper = mount(EventViewerComponent);

    // Wait for async setup to resolve
    await flushPromises();
    expect(wrapper.text()).toContain("Event Viewer"); // Title of the page
    expect(wrapper.text()).toContain("1 event");

    // Find header and check content
    const headerRow = wrapper.findAll("thead tr th");
    expect(headerRow[0]!.text()).toBe("DateTime"); // First col
    expect(headerRow[1]!.text()).toBe("Event"); // Second col

    // Find row and check content
    const rows = wrapper.findAll("tbody tr");
    expect(rows.length).toBe(1);

    const rowCells = rows[0]!.findAll("td");
    expect(rowCells[0]!.text()).toContain("2/19/26"); // Datetime, limit to date due to TZ issues in runner
    expect(rowCells[1]!.text()).toBe(
      "NODE-SETTINGS-GET-SUCCESSHub AdapterNodeInfoA user fetched the node's configurations settings",
    );
  });

  it("No events in response", async () => {
    vi.mocked(getEvents).mockResolvedValue({
      data: ref<EventLogResponse>({
        data: [],
        meta: { count: 0, total: 0, limit: 0, offset: 0 },
      }),
      pending: ref(false),
      error: ref(undefined),
      status: ref("success"),
      refresh: vi.fn(),
      execute: vi.fn(),
      clear: vi.fn(),
    });

    const wrapper = mount(EventViewerComponent);

    // Wait for async setup to resolve
    await flushPromises();

    expect(wrapper.text()).toContain("No events found");
    expect(wrapper.text()).toContain("0 events");
  });
});
