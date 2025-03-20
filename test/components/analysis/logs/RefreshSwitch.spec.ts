import { mount } from "@vue/test-utils";
import { describe, test, expect } from "vitest";
import RefreshSwitch from "~/components/analysis/logs/RefreshSwitch.vue";

describe("RefreshSwitch.vue", async () => {
  const wrapper = mount(RefreshSwitch);

  test("Mounts initially as disabled", () => {
    expect(wrapper.get("input").attributes("aria-checked")).toBe("false");
  });

  test("Toggles state when clicked", async () => {
    const toggle = wrapper.find(".refresh-toggle");
    expect(toggle.attributes("data-p-checked")).toBe("false"); // start false
    await wrapper.find("input").trigger("change");

    expect(wrapper.emitted()).toBeTruthy();
    expect(toggle.attributes("data-p-checked")).toBe("true");

    // Back to false
    await wrapper.find("input").trigger("change");
    expect(toggle.attributes("data-p-checked")).toBe("false"); // start false
  });
});
