import { nextTick } from "vue";
import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AutostartField from "~/components/preferences/AutostartField.vue";
import type { AutostartSettings } from "~/services/Api";

const ToggleSwitchStub = {
  props: ["modelValue"],
  emits: ["update:modelValue"],
  template:
    '<button class="mock-toggle" :data-checked="String(modelValue)" @click="$emit(\'update:modelValue\', !modelValue)" />',
};

const InputNumberStub = {
  props: ["modelValue", "disabled", "min", "invalid", "fluid", "label"],
  emits: ["update:modelValue"],
  template:
    '<input class="mock-input-number" :disabled="disabled" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" />',
};

function mountField(modelValue: AutostartSettings) {
  return mount(AutostartField, {
    props: { modelValue },
    global: {
      stubs: {
        ToggleSwitch: ToggleSwitchStub,
        InputNumber: InputNumberStub,
        Divider: true,
      },
    },
  });
}

describe("AutostartField.vue", () => {
  it("renders the autostart enabled section", () => {
    const wrapper = mountField({ enabled: false, interval: 60 });
    expect(
      wrapper.find(".autostart-enabled-field .settings-description-title").text(),
    ).toBe("Autostart Analyses");
    expect(
      wrapper
        .find(".autostart-enabled-field .setting-description-text")
        .text(),
    ).toContain("Immediately start an analysis");
  });

  it("renders the autostart interval section", () => {
    const wrapper = mountField({ enabled: false, interval: 60 });
    expect(
      wrapper.find(".autostart-interval-field .settings-description-title").text(),
    ).toBe("Autostart Interval");
    expect(
      wrapper
        .find(".autostart-interval-field .setting-description-text")
        .text(),
    ).toContain("How often");
  });

  it("toggle is off when enabled is false", () => {
    const wrapper = mountField({ enabled: false, interval: 60 });
    expect(wrapper.find(".mock-toggle").attributes("data-checked")).toBe(
      "false",
    );
  });

  it("toggle is on when enabled is true", () => {
    const wrapper = mountField({ enabled: true, interval: 60 });
    expect(wrapper.find(".mock-toggle").attributes("data-checked")).toBe("true");
  });

  it("InputNumber is disabled when autostart is off", () => {
    const wrapper = mountField({ enabled: false, interval: 60 });
    expect(
      wrapper.find(".mock-input-number").element.hasAttribute("disabled"),
    ).toBe(true);
  });

  it("InputNumber is enabled when autostart is on", () => {
    const wrapper = mountField({ enabled: true, interval: 60 });
    expect(
      wrapper.find(".mock-input-number").element.hasAttribute("disabled"),
    ).toBe(false);
  });

  it("InputNumber shows the initial interval value", () => {
    const wrapper = mountField({ enabled: true, interval: 120 });
    expect(wrapper.find(".mock-input-number").element.getAttribute("value")).toBe(
      "120",
    );
  });

  it("InputNumber becomes enabled after toggling autostart on", async () => {
    const wrapper = mountField({ enabled: false, interval: 60 });
    expect(
      wrapper.find(".mock-input-number").element.hasAttribute("disabled"),
    ).toBe(true);

    await wrapper.find(".mock-toggle").trigger("click");
    await nextTick();

    expect(
      wrapper.find(".mock-input-number").element.hasAttribute("disabled"),
    ).toBe(false);
  });

  it("InputNumber becomes disabled after toggling autostart off", async () => {
    const wrapper = mountField({ enabled: true, interval: 60 });
    expect(
      wrapper.find(".mock-input-number").element.hasAttribute("disabled"),
    ).toBe(false);

    await wrapper.find(".mock-toggle").trigger("click");
    await nextTick();

    expect(
      wrapper.find(".mock-input-number").element.hasAttribute("disabled"),
    ).toBe(true);
  });
});
