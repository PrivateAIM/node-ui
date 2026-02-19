import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import DateFilterGraph from "~/components/events/DateFilterGraph.vue";
import { fakeEventResponse } from "~/test/components/events/constants";

vi.mock("#app", () => ({
  useNuxtApp: () => ({
    $hubApi: vi.fn().mockResolvedValue(fakeEventResponse),
  }),
}));

describe("DateFilterGraph.vue", () => {
  it("Show event count", () => {
    const wrapper = mount(DateFilterGraph, {
      props: { eventCount: 2 },
    });

    expect(wrapper.text()).toContain("Event Viewer");
    expect(wrapper.html()).toContain("2 events");
  });

  it("Shows singular form when eventCount is 1", () => {
    const wrapper = mount(DateFilterGraph, {
      props: { eventCount: 1 },
    });

    expect(wrapper.html()).toContain("1 event");
  });

  it("Emits showRequestedEvents when submit clicked", async () => {
    const wrapper = mount(DateFilterGraph, { props: { eventCount: 1 } });

    const submit = wrapper.find(".custom-date-filter-submit-btn button");
    expect(submit.exists()).toBe(true);
    await submit.trigger("click");

    expect(wrapper.emitted("showRequestedEvents")).toHaveLength(1);
  });
});
