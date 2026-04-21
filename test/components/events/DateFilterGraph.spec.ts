import { describe, expect, it } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import DateFilterGraph from "~/components/events/DateFilterGraph.vue";

describe("DateFilterGraph.vue", () => {
  it("Show event count", () => {
    const wrapper = mount(DateFilterGraph, {
      props: { eventCount: 2, loading: false },
    });

    expect(wrapper.text()).toContain("Event Viewer");
    expect(wrapper.html()).toContain("2 events");
  });

  it("Shows singular form when eventCount is 1", () => {
    const wrapper = mount(DateFilterGraph, {
      props: { eventCount: 1, loading: false },
    });

    expect(wrapper.html()).toContain("1 event");
  });

  it("Emits applyDateFilter when submit clicked", async () => {
    const wrapper = mount(DateFilterGraph, {
      props: { eventCount: 1, loading: false },
    });

    const submit = wrapper.find(".custom-date-filter-submit-btn button");
    expect(submit.exists()).toBe(true);
    await submit.trigger("click");
    await flushPromises();

    expect(wrapper.emitted("applyDateFilter")).toHaveLength(1);
  });
});
