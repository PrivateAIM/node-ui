import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";
import RefreshSwitch from "~/components/analysis/logs/RefreshSwitch.vue";

describe("RefreshSwitch.vue", async () => {
  const wrapper = mount(RefreshSwitch, {
    props: {
      disabled: false,
    },
  });

  test("Mounts initially as turned off", () => {
    expect(wrapper.get("input").attributes("aria-checked")).toBe("false");
    expect(wrapper.find("#refreshBtn").attributes("data-p-disabled")).toBe(
      "false",
    );
  });

  test("Toggles state when clicked", async () => {
    const toggle = wrapper.find("#refreshBtn");
    expect(toggle.attributes("data-p-checked")).toBe("false"); // start false
    await wrapper.find("input").trigger("change");

    expect(wrapper.emitted()).toBeTruthy();
    expect(toggle.attributes("data-p-checked")).toBe("true");

    // Back to false
    await wrapper.find("input").trigger("change");
    expect(toggle.attributes("data-p-checked")).toBe("false"); // start false
  });

  test("Switch disabled", () => {
    const disabledWrapper = mount(RefreshSwitch, {
      props: {
        disabled: true,
      },
    });
    expect(
      disabledWrapper.find("#refreshBtn").attributes("data-p-disabled"),
    ).toBe("true");
  });
});
