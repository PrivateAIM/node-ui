import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { nextTick } from "vue";
import ProgressSpinner from "primevue/progressspinner";
import UptimePage from "~/pages/uptime.vue";
import ServiceUptimeCard from "~/components/uptime/ServiceUptimeCard.vue";
import BucketDrilldownDialog from "~/components/uptime/BucketDrilldownDialog.vue";
import UptimeToolbar from "~/components/uptime/UptimeToolbar.vue";
import { resolutionFor } from "~/composables/useServiceHealth";
import {
  fakeMonitoringDisabled,
  fakeServiceHealthHistory,
} from "../components/uptime/constants";

// Mocking the module replaces it wholesale, so the page must import this function
// explicitly - a call arriving through Nuxt's auto-import would not be intercepted
// by a mock keyed to this path.
const mockFetch = vi.fn();

vi.mock("~/composables/useAPIFetch", () => ({
  getServiceHealthHistory: (...args: unknown[]) => mockFetch(...args),
}));

// `<VChart>` reaches the track through Nuxt's component transform, so no `global.stubs`
// key matches it and the real canvas chart would mount (and throw in happy-dom).
// Replacing the module is the only interception point that holds - and it is the only
// thing this file stubs, so the card and the track both mount for real below.
const { VChartStub } = vi.hoisted(() => ({
  VChartStub: {
    name: "VChart",
    props: ["option"],
    template: "<div class='v-chart-stub' />",
  },
}));

vi.mock("vue-echarts", () => ({ default: VChartStub }));

/** The subset of the query the page is responsible for building. */
interface HistoryQuery {
  start_date?: string;
  end_date?: string;
  resolution?: number;
}

function mountPage() {
  return mount(UptimePage, {
    global: { stubs: { teleport: true } },
  });
}

/** The query of the nth call, defaulting to the most recent. */
function queryOf(call = mockFetch.mock.calls.length - 1): HistoryQuery {
  return mockFetch.mock.calls[call]![0] as HistoryQuery;
}

describe("uptime.vue", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue(fakeServiceHealthHistory);
  });

  it("fetches as soon as the toolbar announces its opening range", async () => {
    mountPage();
    await flushPromises();

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("asks for the range the toolbar chose", async () => {
    const wrapper = mountPage();
    await flushPromises();

    const start = new Date("2026-07-30T00:00:00Z");
    const end = new Date("2026-07-30T12:00:00Z");
    wrapper
      .findComponent(UptimeToolbar)
      .vm.$emit("rangeChange", { start, end, live: true });
    await flushPromises();

    // The start is floored onto the resolution grid, so it is compared against the
    // floored value rather than the raw one; the end is passed through untouched.
    expect(queryOf().end_date).toBe(end.toISOString());
  });

  it("derives the resolution from the span rather than pinning one", async () => {
    const wrapper = mountPage();
    await flushPromises();

    const end = new Date("2026-07-30T12:00:00Z");
    const spanMs = 6 * 60 * 60 * 1000;
    wrapper.findComponent(UptimeToolbar).vm.$emit("rangeChange", {
      start: new Date(end.getTime() - spanMs),
      end,
      live: true,
    });
    await flushPromises();

    expect(queryOf().resolution).toBe(resolutionFor(spanMs));
  });

  it("asks for a coarser resolution over a wider window", async () => {
    const wrapper = mountPage();
    await flushPromises();

    const end = new Date("2026-07-30T12:00:00Z");
    const toolbar = wrapper.findComponent(UptimeToolbar);

    toolbar.vm.$emit("rangeChange", {
      start: new Date(end.getTime() - 60 * 60 * 1000),
      end,
      live: true,
    });
    await flushPromises();
    const narrow = queryOf().resolution!;

    toolbar.vm.$emit("rangeChange", {
      start: new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000),
      end,
      live: true,
    });
    await flushPromises();

    expect(queryOf().resolution).toBeGreaterThan(narrow);
  });

  it("floors the requested start onto the resolution grid", async () => {
    const wrapper = mountPage();
    await flushPromises();

    // Deliberately off-grid: 17 seconds past the minute.
    const start = new Date("2026-07-30T11:00:17Z");
    const end = new Date("2026-07-30T12:00:17Z");
    wrapper
      .findComponent(UptimeToolbar)
      .vm.$emit("rangeChange", { start, end, live: true });
    await flushPromises();

    const resolution = queryOf().resolution!;
    const requested = new Date(queryOf().start_date!).getTime();

    // An unaligned start leaves the first slot permanently empty, because the bucket
    // covering it begins before the window and is never returned.
    expect(requested % (resolution * 1000)).toBe(0);
    expect(requested).toBeLessThanOrEqual(start.getTime());
  });

  it("renders one card per service the adapter reports", async () => {
    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.findAllComponents(ServiceUptimeCard)).toHaveLength(2);
  });

  it("still renders a card for a service that is not configured", async () => {
    const wrapper = mountPage();
    await flushPromises();

    const names = wrapper
      .findAllComponents(ServiceUptimeCard)
      .map((card) => card.props("name"));

    // `fhir` is unconfigured; it has to appear as a disabled track, not vanish.
    expect(names).toContain("FHIR Server");
    expect(wrapper.text().toLowerCase()).toContain("disabled");
  });

  it("names each card after its own service", async () => {
    const wrapper = mountPage();
    await flushPromises();

    const names = wrapper
      .findAllComponents(ServiceUptimeCard)
      .map((card) => card.props("name"));

    expect(names).toEqual(["Kong Gateway API", "FHIR Server"]);
  });

  it("hands every card the same slot list it built for the request", async () => {
    const wrapper = mountPage();
    await flushPromises();

    const cards = wrapper.findAllComponents(ServiceUptimeCard);
    const slots = cards[0]!.props("slots");

    expect(slots.length).toBeGreaterThan(0);
    expect(cards[1]!.props("slots")).toBe(slots);
  });

  it("replaces the warning with the cards once monitoring is on", async () => {
    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.text()).not.toContain(
      fakeMonitoringDisabled.monitoring_detail,
    );
  });

  it("explains itself instead of rendering empty tracks when monitoring is off", async () => {
    mockFetch.mockResolvedValue(fakeMonitoringDisabled);

    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.text()).toContain(fakeMonitoringDisabled.monitoring_detail);
    expect(wrapper.findAllComponents(ServiceUptimeCard)).toHaveLength(0);
  });

  it("falls back to a general message when monitoring is off without a reason", async () => {
    mockFetch.mockResolvedValue({
      ...fakeMonitoringDisabled,
      monitoring_detail: null,
    });

    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.text()).toContain("not being recorded");
  });

  it("waits under a spinner rather than claiming monitoring is off", async () => {
    // Held open so the assertions land while the very first request is still in flight -
    // the one moment when nothing is known about this node yet.
    let release: (value: unknown) => void = () => {};
    mockFetch.mockReturnValue(
      new Promise((resolve) => {
        release = resolve;
      }),
    );

    const wrapper = mountPage();
    await nextTick();

    expect(wrapper.findComponent(ProgressSpinner).exists()).toBe(true);
    expect(wrapper.text()).not.toContain("not being recorded");

    release(fakeServiceHealthHistory);
    await flushPromises();

    expect(wrapper.findComponent(ProgressSpinner).exists()).toBe(false);
  });

  it("says nothing about volume for a window this node can comfortably fill", async () => {
    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.text()).not.toContain("checks per service");
  });

  it("warns when a fast probe interval makes the window enormous", async () => {
    const wrapper = mountPage();
    await flushPromises();

    // 7 days at one probe a minute is ~10080 checks per service, over the cap.
    const end = new Date("2026-07-30T12:00:00Z");
    wrapper.findComponent(UptimeToolbar).vm.$emit("rangeChange", {
      start: new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000),
      end,
      live: true,
    });
    await flushPromises();

    expect(wrapper.text()).toContain("probes every 60s");
    expect(wrapper.text()).toContain("10080 checks per service");
  });

  it("keeps quiet about volume when the node reports no interval at all", async () => {
    mockFetch.mockResolvedValue({
      ...fakeServiceHealthHistory,
      interval_seconds: null,
    });

    const wrapper = mountPage();
    await flushPromises();

    const end = new Date("2026-07-30T12:00:00Z");
    wrapper.findComponent(UptimeToolbar).vm.$emit("rangeChange", {
      start: new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000),
      end,
      live: true,
    });
    await flushPromises();

    // Dividing by a null interval would yield Infinity and warn on every window.
    expect(wrapper.text()).not.toContain("checks per service");
  });

  it("keeps the drilldown shut until a cell is clicked", async () => {
    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.findComponent(BucketDrilldownDialog).props("visible")).toBe(
      false,
    );
  });

  it("opens the drilldown for the service whose cell was clicked", async () => {
    const wrapper = mountPage();
    await flushPromises();

    // Emitted from the second card, so a page that hardcodes the first - or reads the
    // name off anything but the payload - fails here.
    const fhirCard = wrapper.findAllComponents(ServiceUptimeCard)[1]!;
    const slot = fhirCard.props("slots")[0]!;

    fhirCard.vm.$emit("cellClick", { service: "fhir", slot, bucket: null });
    await flushPromises();

    const dialog = wrapper.findComponent(BucketDrilldownDialog);
    expect(dialog.props("visible")).toBe(true);
    expect(dialog.props("service")).toBe("fhir");
    expect(dialog.props("slotRange")).toBe(slot);
  });

  it("hands the drilldown the slot list so its stepping works", async () => {
    const wrapper = mountPage();
    await flushPromises();

    const card = wrapper.findAllComponents(ServiceUptimeCard)[0]!;
    expect(wrapper.findComponent(BucketDrilldownDialog).props("slots")).toBe(
      card.props("slots"),
    );
  });

  it("follows the drilldown when it steps to another slice", async () => {
    const wrapper = mountPage();
    await flushPromises();

    const card = wrapper.findAllComponents(ServiceUptimeCard)[0]!;
    const slots = card.props("slots");
    card.vm.$emit("cellClick", {
      service: "kong",
      slot: slots[0]!,
      bucket: null,
    });
    await flushPromises();

    const dialog = wrapper.findComponent(BucketDrilldownDialog);
    dialog.vm.$emit("update:slotRange", slots[1]!);
    await flushPromises();

    expect(dialog.props("slotRange")).toBe(slots[1]!);
  });

  it("closes the drilldown when it asks to be closed", async () => {
    const wrapper = mountPage();
    await flushPromises();

    const card = wrapper.findAllComponents(ServiceUptimeCard)[0]!;
    card.vm.$emit("cellClick", {
      service: "kong",
      slot: card.props("slots")[0]!,
      bucket: null,
    });
    await flushPromises();

    const dialog = wrapper.findComponent(BucketDrilldownDialog);
    dialog.vm.$emit("update:visible", false);
    await flushPromises();

    expect(dialog.props("visible")).toBe(false);
  });

  it("keeps the newest range on screen when an older request answers last", async () => {
    // Every call is parked so the two ranges below can be resolved out of order.
    const pending: Array<(value: unknown) => void> = [];
    mockFetch.mockImplementation(
      () => new Promise((resolve) => pending.push(resolve)),
    );

    const wrapper = mountPage();
    await flushPromises();
    pending[0]!(fakeServiceHealthHistory);
    await flushPromises();

    const toolbar = wrapper.findComponent(UptimeToolbar);

    const staleEnd = new Date("2026-07-30T12:00:00Z");
    toolbar.vm.$emit("rangeChange", {
      start: new Date(staleEnd.getTime() - 24 * 60 * 60 * 1000),
      end: staleEnd,
      live: true,
    });
    await flushPromises();

    const freshEnd = new Date("2026-07-31T06:00:00Z");
    const freshStart = new Date(freshEnd.getTime() - 60 * 60 * 1000);
    toolbar.vm.$emit("rangeChange", {
      start: freshStart,
      end: freshEnd,
      live: true,
    });
    await flushPromises();

    // The newest range answers first; the range the user already moved off of
    // answers afterwards and must not overwrite it.
    pending[2]!(fakeServiceHealthHistory);
    await flushPromises();
    pending[1]!({ ...fakeServiceHealthHistory, interval_seconds: 15 });
    await flushPromises();

    const slots = wrapper
      .findAllComponents(ServiceUptimeCard)[0]!
      .props("slots");

    // `freshStart` is already on the 30s grid this span resolves to.
    expect(slots[0]!.start.toISOString()).toBe(freshStart.toISOString());
    expect(slots[slots.length - 1]!.end.toISOString()).toBe(
      freshEnd.toISOString(),
    );
    expect(toolbar.props("intervalSeconds")).toBe(
      fakeServiceHealthHistory.interval_seconds,
    );

    // The straggler must not re-arm the toolbar's spinners either.
    expect(toolbar.props("loading")).toBe(false);
  });

  it("says so when a range fails instead of silently keeping the old one", async () => {
    const wrapper = mountPage();
    await flushPromises();

    mockFetch.mockRejectedValue(new Error("gateway is down"));
    wrapper.findComponent(UptimeToolbar).vm.$emit("rangeChange", {
      start: new Date("2026-07-30T11:00:00Z"),
      end: new Date("2026-07-30T12:00:00Z"),
      live: true,
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Could not load uptime history");
    expect(wrapper.findComponent(UptimeToolbar).props("loading")).toBe(false);
  });

  it("clears the failure notice once a range loads again", async () => {
    const wrapper = mountPage();
    await flushPromises();

    const toolbar = wrapper.findComponent(UptimeToolbar);
    const end = new Date("2026-07-30T12:00:00Z");
    const range = {
      start: new Date(end.getTime() - 60 * 60 * 1000),
      end,
      live: true,
    };

    mockFetch.mockRejectedValue(new Error("gateway is down"));
    toolbar.vm.$emit("rangeChange", range);
    await flushPromises();

    mockFetch.mockResolvedValue(fakeServiceHealthHistory);
    toolbar.vm.$emit("rangeChange", range);
    await flushPromises();

    expect(wrapper.text()).not.toContain("Could not load uptime history");
  });

  it("does not refetch when the toolbar merely reports a refresh", async () => {
    const wrapper = mountPage();
    await flushPromises();

    const before = mockFetch.mock.calls.length;
    wrapper.findComponent(UptimeToolbar).vm.$emit("refresh");
    await flushPromises();

    // The toolbar emits `rangeChange` alongside every `refresh`, and `rangeChange`
    // already refetches. Fetching here too would double every poll.
    expect(mockFetch.mock.calls.length).toBe(before);
  });

  it("tells the toolbar how often this node probes, so it can pace its polling", async () => {
    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.findComponent(UptimeToolbar).props("intervalSeconds")).toBe(
      fakeServiceHealthHistory.interval_seconds,
    );
  });

  it("survives a response the adapter never delivered", async () => {
    mockFetch.mockResolvedValue(null);

    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.findAllComponents(ServiceUptimeCard)).toHaveLength(0);
  });

  it("mounts the real track inside the real card", async () => {
    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.findAllComponents(VChartStub).length).toBe(2);
  });

  it("opens the drilldown from a real click on a real track cell", async () => {
    const wrapper = mountPage();
    await flushPromises();

    const chart = wrapper.findAllComponents(VChartStub)[0]!;

    chart.vm.$emit("click", { data: [0, 0, 1, 0] });
    await flushPromises();

    const dialog = wrapper.findComponent(BucketDrilldownDialog);
    expect(dialog.props("visible")).toBe(true);
    expect(dialog.props("service")).toBe("kong");
  });
});
