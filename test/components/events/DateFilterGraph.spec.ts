import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import DateFilterGraph from "~/components/events/DateFilterGraph.vue";

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const FAKE_NOW = new Date("2026-05-31T12:00:00.000Z");

describe("DateFilterGraph.vue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FAKE_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders with Event Viewer title", async () => {
    const wrapper = mount(DateFilterGraph, { props: { loading: false } });
    await flushPromises();

    expect(wrapper.text()).toContain("Event Viewer");
  });

  it("renders a Limit label for the query limit input", async () => {
    const wrapper = mount(DateFilterGraph, { props: { loading: false } });
    await flushPromises();

    expect(wrapper.text()).toContain("Limit");
  });

  it("emits applyDateFilter on mount with a 5-minute window and default limit of 50", async () => {
    const wrapper = mount(DateFilterGraph, { props: { loading: false } });
    await flushPromises();

    const emitted = wrapper.emitted("applyDateFilter") as [Date, Date, number][];
    expect(emitted).toHaveLength(1);

    const [startDate, endDate, limit] = emitted[0]!;
    expect(limit).toBe(50);
    expect(endDate).toEqual(FAKE_NOW);
    expect(startDate).toEqual(new Date(FAKE_NOW.getTime() - FIVE_MINUTES_MS));
  });

  it("emits applyDateFilter with the limit when Apply button is clicked", async () => {
    const wrapper = mount(DateFilterGraph, { props: { loading: false } });
    await flushPromises();

    const submit = wrapper.find(".custom-date-filter-submit-btn button");
    expect(submit.exists()).toBe(true);
    await submit.trigger("click");
    await flushPromises();

    const emitted = wrapper.emitted("applyDateFilter") as [Date, Date, number][];
    // First emit is from onMounted, second from clicking Apply
    expect(emitted).toHaveLength(2);
    const [, , limit] = emitted[1]!;
    expect(limit).toBe(50);
  });

  it("uses provided initialStartDate and initialEndDate props over computed defaults", async () => {
    const customStart = new Date("2026-05-31T10:00:00Z");
    const customEnd = new Date("2026-05-31T11:00:00Z");

    const wrapper = mount(DateFilterGraph, {
      props: { loading: false, initialStartDate: customStart, initialEndDate: customEnd },
    });
    await flushPromises();

    const emitted = wrapper.emitted("applyDateFilter") as [Date, Date, number][];
    const [startDate, endDate] = emitted[0]!;
    expect(startDate).toEqual(customStart);
    expect(endDate).toEqual(customEnd);
  });
});
