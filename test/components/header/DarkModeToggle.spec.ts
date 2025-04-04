import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import DarkModeToggle from "~/components/header/DarkModeToggle.vue";

describe("DarkModeToggle.vue", () => {
  it("Check mode and toggle", async () => {
    const wrapper = mount(DarkModeToggle);

    const htmlElement = document.documentElement;
    expect(htmlElement.getAttribute("class")).toBe("flame-light");

    const toggle = wrapper.find(".dark-mode-toggle-switch");

    await toggle.trigger("click");
    expect(htmlElement.getAttribute("class")).toBe("flame-dark");

    await toggle.trigger("click");
    expect(htmlElement.getAttribute("class")).toBe("flame-light");
  });
});
