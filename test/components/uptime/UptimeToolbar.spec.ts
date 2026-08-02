import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import UptimeToolbar from "~/components/uptime/UptimeToolbar.vue";
import { MAX_SPAN_MS, SPAN_PRESETS } from "~/composables/useServiceHealth";

const FAKE_NOW = new Date("2026-07-30T12:00:00.000Z");
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

interface RangeEvent {
  start: Date;
  end: Date;
  live: boolean;
}

function mountToolbar(props: Record<string, unknown> = {}) {
  return mount(UptimeToolbar, {
    props: { loading: false, intervalSeconds: 60, ...props },
  });
}

type Toolbar = ReturnType<typeof mountToolbar>;

/** Every range the toolbar has asked for so far, oldest first. */
function ranges(wrapper: Toolbar): RangeEvent[] {
  const emitted = wrapper.emitted("rangeChange") as [RangeEvent][] | undefined;

  return (emitted ?? []).map(([payload]) => payload);
}

function latestRange(wrapper: Toolbar): RangeEvent {
  const all = ranges(wrapper);

  return all[all.length - 1]!;
}

/**
 * The preset options are rendered by SelectButton, which gives each one a plain
 * `<button>` and no hook of its own, so they are found by their visible label -
 * the same string a reader clicks.
 */
function optionLabelled(wrapper: Toolbar, label: string) {
  const match = wrapper
    .findAll("button")
    .find((button) => button.text() === label);
  if (!match) throw new Error(`no option labelled "${label}"`);

  return match;
}

async function chooseRange(wrapper: Toolbar, label: string) {
  await optionLabelled(wrapper, label).trigger("click");
  await flushPromises();
}

/** Sets both custom bounds and lets the validity computed settle. */
async function setCustomRange(
  wrapper: Toolbar,
  start: Date | null,
  end: Date | null,
) {
  wrapper.vm.customStart = start;
  wrapper.vm.customEnd = end;
  await wrapper.vm.$nextTick();
}

async function toggleAutoRefresh(wrapper: Toolbar) {
  await wrapper.get("[data-testid='uptime-auto-refresh']").trigger("click");
  await flushPromises();
}

/** Advances the frozen clock, which also fires any interval due in that window. */
async function elapse(ms: number) {
  await vi.advanceTimersByTimeAsync(ms);
  await flushPromises();
}

describe("UptimeToolbar.vue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FAKE_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders every preset label", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    // Read off the exported presets rather than a copy of them, so a preset added
    // to the composable cannot be silently dropped from the toolbar.
    for (const preset of SPAN_PRESETS) {
      expect(wrapper.text()).toContain(preset.label);
    }
  });

  it("offers a refresh control", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    expect(wrapper.text().toLowerCase()).toContain("refresh");
  });

  it("emits a 24h range on mount", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    // The page has no range of its own until the toolbar hands it one, so mounting
    // without emitting would leave it permanently empty.
    expect(ranges(wrapper)).toHaveLength(1);

    const { start, end } = latestRange(wrapper);
    expect(end).toEqual(FAKE_NOW);
    expect(end.getTime() - start.getTime()).toBe(24 * HOUR_MS);
  });

  it("marks a preset range as live", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    expect(latestRange(wrapper).live).toBe(true);
  });

  it("emits the chosen preset's span, ending now", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    await chooseRange(wrapper, "1h");

    const { start, end, live } = latestRange(wrapper);
    expect(end).toEqual(FAKE_NOW);
    expect(end.getTime() - start.getTime()).toBe(HOUR_MS);
    expect(live).toBe(true);
  });

  it("emits refresh when the refresh button is pressed", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    await wrapper.get("[data-testid='uptime-refresh']").trigger("click");

    expect(wrapper.emitted("refresh")).toHaveLength(1);
  });

  it("slides the window forward when refresh is pressed", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    await elapse(5 * 60 * 1000);
    await wrapper.get("[data-testid='uptime-refresh']").trigger("click");

    // Re-emitting the same bounds would refetch a window that has already gone
    // stale at its leading edge, so the range has to be recomputed against now.
    expect(ranges(wrapper)).toHaveLength(2);
    expect(latestRange(wrapper).end).toEqual(
      new Date(FAKE_NOW.getTime() + 5 * 60 * 1000),
    );
  });

  it("does not fire a second refresh while one is still in flight", async () => {
    const wrapper = mountToolbar({ loading: true });
    await flushPromises();

    await wrapper.get("[data-testid='uptime-refresh']").trigger("click");

    expect(wrapper.emitted("refresh")).toBeUndefined();
    expect(ranges(wrapper)).toHaveLength(1);
  });

  it("rejects a custom range wider than seven days", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    await setCustomRange(
      wrapper,
      new Date("2026-07-01T00:00:00Z"),
      new Date("2026-07-30T00:00:00Z"),
    );

    expect(wrapper.vm.isInvalidRange).toBe(true);
  });

  it("accepts a custom range of exactly seven days", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    await setCustomRange(
      wrapper,
      new Date("2026-07-23T00:00:00Z"),
      new Date("2026-07-30T00:00:00Z"),
    );

    expect(wrapper.vm.isInvalidRange).toBe(false);
  });

  it("rejects an inverted custom range", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    await setCustomRange(
      wrapper,
      new Date("2026-07-30T00:00:00Z"),
      new Date("2026-07-29T00:00:00Z"),
    );

    expect(wrapper.vm.isInvalidRange).toBe(true);
  });

  it("rejects a custom range whose picker was cleared", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    // DatePicker hands back null when its input is emptied, and a null bound has
    // no timestamp to compare - it must read as invalid rather than throw.
    await setCustomRange(wrapper, null, new Date("2026-07-30T00:00:00Z"));

    expect(wrapper.vm.isInvalidRange).toBe(true);
  });

  it("rejects a date the picker could not parse", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    // A hand-typed date the picker cannot read comes back as an Invalid Date, whose
    // every comparison is false - so the bounds below would wave it through.
    await setCustomRange(
      wrapper,
      new Date("the day before yesterday"),
      FAKE_NOW,
    );

    expect(wrapper.vm.isInvalidRange).toBe(true);
  });

  it("seeds the custom range from the preset it replaces", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    await chooseRange(wrapper, "1h");
    await chooseRange(wrapper, "Custom");

    // Opening the pickers on a stale window would make the first custom fetch
    // disagree with the track the reader was just looking at.
    expect(wrapper.vm.customEnd).toEqual(FAKE_NOW);
    expect(wrapper.vm.customStart).toEqual(
      new Date(FAKE_NOW.getTime() - HOUR_MS),
    );
  });

  it("labels the custom pickers' inputs, not their wrappers", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    await chooseRange(wrapper, "Custom");

    // DatePicker's `id` lands on the outer span; only `inputId` reaches the <input>,
    // and a `for` pointing at anything else names nothing for a screen reader.
    for (const field of ["uptime_start", "uptime_end"]) {
      expect(wrapper.get(`label[for='${field}']`).text()).not.toBe("");
      expect(wrapper.get(`#${field}`).element.tagName).toBe("INPUT");
    }
  });

  it("waits for apply before emitting a custom range", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    await chooseRange(wrapper, "Custom");

    // Switching to Custom only opens the pickers; the reader has not chosen a
    // window yet, so refetching here would be a wasted round trip.
    expect(ranges(wrapper)).toHaveLength(1);
  });

  it("marks an applied custom range as not live", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    await chooseRange(wrapper, "Custom");
    const start = new Date("2026-07-20T08:00:00Z");
    const end = new Date("2026-07-21T08:00:00Z");
    await setCustomRange(wrapper, start, end);
    await wrapper.get("[data-testid='uptime-apply']").trigger("click");

    expect(ranges(wrapper)).toHaveLength(2);
    expect(latestRange(wrapper)).toEqual({ start, end, live: false });
  });

  it("refuses to apply a custom range wider than the maximum", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    await chooseRange(wrapper, "Custom");
    // Nothing downstream rejects an over-long window: `resolutionFor` falls back to
    // its widest slice and quietly builds more cells than the track can show, so the
    // refusal has to happen here.
    await setCustomRange(
      wrapper,
      new Date(FAKE_NOW.getTime() - MAX_SPAN_MS - HOUR_MS),
      FAKE_NOW,
    );
    await wrapper.get("[data-testid='uptime-apply']").trigger("click");

    expect(ranges(wrapper)).toHaveLength(1);
  });

  it("refuses to apply an inverted custom range", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    await chooseRange(wrapper, "Custom");
    await setCustomRange(
      wrapper,
      FAKE_NOW,
      new Date(FAKE_NOW.getTime() - HOUR_MS),
    );
    await wrapper.get("[data-testid='uptime-apply']").trigger("click");

    expect(ranges(wrapper)).toHaveLength(1);
  });

  it("says why a refused range was refused", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    await chooseRange(wrapper, "Custom");
    expect(wrapper.find("[data-testid='uptime-range-error']").exists()).toBe(
      false,
    );

    await setCustomRange(
      wrapper,
      new Date(FAKE_NOW.getTime() - MAX_SPAN_MS - HOUR_MS),
      FAKE_NOW,
    );

    // Spelled out from the constant, so the limit in the message cannot drift
    // away from the one being enforced.
    expect(wrapper.get("[data-testid='uptime-range-error']").text()).toContain(
      `${MAX_SPAN_MS / DAY_MS} days`,
    );
  });

  it("starts with auto-refresh switched off", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    expect(wrapper.vm.autoRefresh).toBe(false);
  });

  it("does not poll until auto-refresh is switched on", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    await elapse(10 * 60 * 1000);

    expect(ranges(wrapper)).toHaveLength(1);
    expect(wrapper.emitted("refresh")).toBeUndefined();
  });

  it("polls at the node's probe interval once auto-refresh is on", async () => {
    const wrapper = mountToolbar({ intervalSeconds: 60 });
    await flushPromises();

    await toggleAutoRefresh(wrapper);
    await elapse(60 * 1000);

    // Polling faster than the node probes would redraw the same track repeatedly.
    expect(ranges(wrapper)).toHaveLength(2);
    expect(wrapper.emitted("refresh")).toHaveLength(1);
    expect(latestRange(wrapper).end).toEqual(
      new Date(FAKE_NOW.getTime() + 60 * 1000),
    );
  });

  it("follows a probe interval that only arrives with the first response", async () => {
    // The page cannot know the cadence until the adapter has answered once, so the
    // toolbar mounts with null and has to re-time itself when the real value lands.
    const wrapper = mountToolbar({ intervalSeconds: null });
    await flushPromises();

    await toggleAutoRefresh(wrapper);
    await wrapper.setProps({ intervalSeconds: 300 });
    await elapse(60 * 1000);

    expect(ranges(wrapper)).toHaveLength(1);

    await elapse(240 * 1000);

    expect(ranges(wrapper)).toHaveLength(2);
  });

  it("floors an implausible probe interval so the page cannot spin", async () => {
    // A zero or negative interval would hand setInterval a delay of 0 and refetch
    // on every tick of the event loop.
    const wrapper = mountToolbar({ intervalSeconds: 0 });
    await flushPromises();

    await toggleAutoRefresh(wrapper);
    await elapse(1000);

    expect(ranges(wrapper)).toHaveLength(1);

    await elapse(14 * 1000);

    expect(ranges(wrapper)).toHaveLength(2);
  });

  it("does not poll a custom range", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    await toggleAutoRefresh(wrapper);
    await chooseRange(wrapper, "Custom");
    await elapse(10 * 60 * 1000);

    // A fixed historical window has nothing new to fetch; polling it would only
    // redraw the identical track and reset the reader's hover.
    expect(ranges(wrapper)).toHaveLength(1);
    expect(wrapper.emitted("refresh")).toBeUndefined();
  });

  it("does not offer auto-refresh while a custom range is shown", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    await chooseRange(wrapper, "Custom");

    expect(
      wrapper.get("[data-testid='uptime-auto-refresh']").attributes("disabled"),
    ).toBeDefined();
  });

  it("resumes polling when a preset is chosen again", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    await toggleAutoRefresh(wrapper);
    await chooseRange(wrapper, "Custom");
    await chooseRange(wrapper, "6h");

    const beforeTick = ranges(wrapper).length;
    await elapse(60 * 1000);

    // The toggle is only disabled for custom, not cleared, so returning to a live
    // window has to start the timer again without a second click.
    expect(ranges(wrapper)).toHaveLength(beforeTick + 1);
  });

  it("stops polling once the toolbar is gone", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    await toggleAutoRefresh(wrapper);

    // Counted rather than watched for a stray emission: VTU drops the emitted log on
    // unmount, so an interval that outlived the component would leave no trace there.
    expect(vi.getTimerCount()).toBe(1);

    wrapper.unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it("stops polling when auto-refresh is switched off again", async () => {
    const wrapper = mountToolbar();
    await flushPromises();

    await toggleAutoRefresh(wrapper);
    await elapse(60 * 1000);
    await toggleAutoRefresh(wrapper);
    await elapse(10 * 60 * 1000);

    expect(ranges(wrapper)).toHaveLength(2);
  });
});
