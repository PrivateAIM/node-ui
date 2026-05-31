import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import EventViewer from "~/components/events/EventViewer.vue";
import { type DefineComponent, defineComponent } from "vue";
import { http, HttpResponse } from "msw";
import { testServer } from "@/test/mockapi/setup";
import { useToast } from "primevue/usetoast";
import { fakeEventResponse } from "./constants";

const FAKE_NOW = new Date("2026-05-31T12:00:00.000Z");

describe("EventViewer.vue", () => {
  let EventViewerComponent: DefineComponent<typeof EventViewer>;
  let mockToastAdd: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockToastAdd = vi.fn();
    vi.mocked(useToast).mockReturnValue({ add: mockToastAdd } as any);
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it("Fetches events on mount with a 5-minute date window and default limit", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(FAKE_NOW);

    let capturedUrl: URL | undefined;
    testServer.use(
      http.get("/events", ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json(fakeEventResponse);
      }),
    );

    mount(EventViewerComponent);
    await flushPromises();

    expect(capturedUrl).toBeDefined();
    expect(capturedUrl!.searchParams.get("limit")).toBe("50");
    expect(capturedUrl!.searchParams.get("start_date")).toBe(
      "2026-05-31T11:55",
    );
    expect(capturedUrl!.searchParams.get("end_date")).toBe("2026-05-31T12:00");
  });
});
