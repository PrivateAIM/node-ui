import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import TagFilterSidePanel from "~/components/events/TagFilterSidePanel.vue";

describe("TagFilterSidePanel.vue", () => {
  it("renders categories and emits clearTagFilter when clear button clicked", async () => {
    const wrapper = mount(TagFilterSidePanel);

    // The menu has the two categories
    expect(wrapper.text()).toContain("Services");
    expect(wrapper.text()).toContain("Log Level");

    const button = wrapper.find("button");
    await button.trigger("click");

    expect(wrapper.emitted()).toHaveProperty("clearTagFilter");
  });
});
