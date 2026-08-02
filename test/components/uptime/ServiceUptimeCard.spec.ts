import { afterEach, describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ServiceUptimeCard from "~/components/uptime/ServiceUptimeCard.vue";
import { buildSlots } from "~/composables/useServiceHealth";
import { fakeServiceHealthHistory } from "./constants";
import type { ServiceHealthSummary } from "~/services/Api";

const kong = fakeServiceHealthHistory.services.kong!;

// Two 30-minute slots across the fixture's range. Both of kong's buckets fall inside
// the first, so this exercises the "some slots have no bucket" alignment.
const slots = buildSlots(
  new Date("2026-07-30T11:00:00Z"),
  new Date("2026-07-30T12:00:00Z"),
  1800,
);

// `buckets` is optional and the adapter only populates it when a resolution was
// requested, so absent - not present-and-empty - is the shape of a real un-bucketed
// response, and the only one that exercises the card's `?? []`.
const bucketsAbsent: ServiceHealthSummary = { ...kong };
delete bucketsAbsent.buckets;

const UptimeTrackStub = {
  name: "UptimeTrack",
  props: ["slots", "buckets", "disabled", "label"],
  template: "<div class='track-stub' />",
};

function mountCard(
  name: string,
  summary: ServiceHealthSummary = fakeServiceHealthHistory.services[name]!,
  slotList = slots,
) {
  return mount(ServiceUptimeCard, {
    props: { name, summary, slots: slotList },
    global: { stubs: { UptimeTrack: UptimeTrackStub } },
  });
}

describe("ServiceUptimeCard.vue", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("names the service with a heading so the cards can be navigated", () => {
    expect(mountCard("kong").get("h3").text()).toBe("kong");
  });

  it("shows the uptime percentage for a monitored service", () => {
    expect(mountCard("kong").get(".service-uptime-card-uptime").text()).toBe(
      "98.33%",
    );
  });

  it("rounds an uptime percentage the adapter did not round for us", () => {
    const wrapper = mountCard("kong", {
      ...kong,
      uptime_percentage: 99.987654321,
    });

    expect(wrapper.get(".service-uptime-card-uptime").text()).toBe("99.99%");
  });

  it("shows a disabled label for an unconfigured service", () => {
    expect(mountCard("fhir").text().toLowerCase()).toContain("disabled");
  });

  it("explains why a disabled service is not monitored", () => {
    expect(mountCard("fhir").get(".service-uptime-card-detail").text()).toBe(
      "No URL configured for this service on this node",
    );
  });

  it("leaves out the caption entirely when a disabled service gives no reason", () => {
    const wrapper = mountCard("fhir", {
      ...fakeServiceHealthHistory.services.fhir!,
      detail: null,
    });

    expect(wrapper.find(".service-uptime-card-detail").exists()).toBe(false);
  });

  it("passes disabled through to the track", () => {
    const track = mountCard("fhir").findComponent(UptimeTrackStub);
    expect(track.props("disabled")).toBe(true);
  });

  it("names the service on the track, whose aria-label is otherwise identical for every card", () => {
    const track = mountCard("kong").findComponent(UptimeTrackStub);
    expect(track.props("label")).toBe("kong");
  });

  it("does not mark a configured service as disabled", () => {
    const track = mountCard("kong").findComponent(UptimeTrackStub);
    expect(track.props("disabled")).toBe(false);
  });

  it("aligns the summary's buckets onto the slot list before handing them over", () => {
    const track = mountCard("kong").findComponent(UptimeTrackStub);

    // One entry per slot, not one per returned bucket: the second slot recorded nothing.
    expect(track.props("buckets")).toEqual([kong.buckets![0], null]);
  });

  it("survives a summary whose buckets are present but empty", () => {
    const track = mountCard("fhir").findComponent(UptimeTrackStub);

    expect(track.props("buckets")).toEqual([null, null]);
  });

  it("survives a summary that carries no buckets key at all", () => {
    const track = mountCard("kong", bucketsAbsent).findComponent(
      UptimeTrackStub,
    );

    expect(track.props("buckets")).toEqual([null, null]);
  });

  it("renders an em dash rather than 0% when a monitored service recorded nothing", () => {
    const summary: ServiceHealthSummary = {
      ...kong,
      total_checks: 0,
      successful_checks: 0,
      failed_checks: 0,
      uptime_percentage: null,
      last_checked_at: null,
      buckets: [],
    };
    const wrapper = mountCard("kong", summary);

    expect(wrapper.get(".service-uptime-card-uptime").text()).toBe("-");
    expect(wrapper.text()).not.toContain("0%");
  });

  it("shows only the clock time for a check made today", () => {
    // Pinned: the test and the render each read the wall clock, and crossing local
    // midnight between the two reads would flip the branch under test.
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-30T12:00:00Z"));

    const checkedAt = new Date().toISOString();
    const wrapper = mountCard("kong", { ...kong, last_checked_at: checkedAt });

    expect(wrapper.get(".service-uptime-card-last-checked").text()).toBe(
      `Last checked ${new Date(checkedAt).toLocaleTimeString()}`,
    );
  });

  it("dates a check that was not made today, so it cannot read as minutes old", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-30T12:00:00Z"));

    const checkedAt = new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const wrapper = mountCard("kong", { ...kong, last_checked_at: checkedAt });

    expect(wrapper.get(".service-uptime-card-last-checked").text()).toBe(
      `Last checked ${new Date(checkedAt).toLocaleString()}`,
    );
  });

  it("writes the range out once beneath the track", () => {
    const wrapper = mountCard("kong");
    const bounds = wrapper
      .get(".service-uptime-card-axis")
      .findAll("span")
      .map((span) => span.text());

    // Compared against `toLocale*` rather than a literal, so the suite does not depend
    // on the runner's locale or timezone.
    expect(bounds).toEqual([
      slots[0]!.start.toLocaleString(),
      slots[slots.length - 1]!.end.toLocaleString(),
    ]);
  });

  it("captions a disabled service with the reason instead of a range", () => {
    expect(mountCard("fhir").find(".service-uptime-card-axis").exists()).toBe(
      false,
    );
  });

  it("does not caption a monitored service with a disabled service's detail", () => {
    expect(mountCard("kong").find(".service-uptime-card-detail").exists()).toBe(
      false,
    );
  });

  it("re-emits cell clicks with the service name attached", async () => {
    const wrapper = mountCard("kong");
    const slot = slots[0]!;

    wrapper
      .findComponent(UptimeTrackStub)
      .vm.$emit("cellClick", { slot, bucket: null });
    await wrapper.vm.$nextTick();

    const emitted = wrapper.emitted("cellClick") as [{ service: string }][];
    expect(emitted[0]![0]).toEqual({ service: "kong", slot, bucket: null });
  });

  it("names itself even when the track's payload claims a different service", async () => {
    const wrapper = mountCard("kong");
    const slot = slots[0]!;

    // The card is the authority on which service it is: whatever the child sends, the
    // name the card was mounted with has to win.
    wrapper
      .findComponent(UptimeTrackStub)
      .vm.$emit("cellClick", { slot, bucket: null, service: "fhir" });
    await wrapper.vm.$nextTick();

    const emitted = wrapper.emitted("cellClick") as [{ service: string }][];
    expect(emitted[0]![0]!.service).toBe("kong");
  });
});
