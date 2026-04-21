import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import EventViewer from "~/components/events/EventViewer.vue";
import { type DefineComponent, defineComponent } from "vue";
import { http, HttpResponse } from "msw";
import { testServer } from "@/test/mockapi/setup";
import { useToast } from "primevue/usetoast";

describe("EventViewer.vue", () => {
  let EventViewerComponent: DefineComponent<typeof EventViewer>;
  let mockToastAdd: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockToastAdd = vi.fn();
    vi.mocked(useToast).mockReturnValue({ add: mockToastAdd } as any);
  });

  beforeAll(async () => {
    EventViewerComponent = defineComponent({
      components: { EventViewer },
      template: "<Suspense><EventViewer/></Suspense>",
    });
  });

  it("Loads events into table", async () => {
    const wrapper = mount(EventViewerComponent);

    await flushPromises();
    expect(wrapper.text()).toContain("Event Viewer");
    expect(wrapper.text()).toContain("1 event");

    const headerRow = wrapper.findAll("thead tr th");
    expect(headerRow[0]!.text()).toBe("DateTime");
    expect(headerRow[1]!.text()).toBe("Event");

    const rows = wrapper.findAll("tbody tr");
    expect(rows.length).toBe(1);

    const rowCells = rows[0]!.findAll("td");
    expect(rowCells[0]!.text()).toContain("2/19/26");
    expect(rowCells[1]!.text()).toBe(
      "NODE-SETTINGS-GET-SUCCESSInfoHub AdapterA user fetched the node's configurations settings",
    );
  });

  it("No events in response", async () => {
    testServer.use(
      http.get("/events", () =>
        HttpResponse.json({
          data: [],
          meta: { count: 0, total: 0, limit: 50, offset: 0 },
        }),
      ),
    );

    const wrapper = mount(EventViewerComponent);

    await flushPromises();

    expect(wrapper.text()).toContain("No events found");
    expect(wrapper.text()).toContain("0 events");
  });

  it("Shows service not configured error on 503", async () => {
    testServer.use(
      http.get("/events", () => new HttpResponse(null, { status: 503 })),
    );

    mount(EventViewerComponent);
    await flushPromises();

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        summary: "Event Log Unavailable",
      }),
    );
  });
});
