import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import RequireDataStoreField from "~/components/preferences/RequireDataStoreField.vue";

const ToggleSwitchStub = {
  props: ["modelValue"],
  emits: ["update:modelValue"],
  template:
    '<button class="mock-toggle" :data-checked="String(modelValue)" @click="$emit(\'update:modelValue\', !modelValue)" />',
};

function mountField(modelValue: boolean) {
  return mount(RequireDataStoreField, {
    props: { modelValue },
    global: { stubs: { ToggleSwitch: ToggleSwitchStub } },
  });
}

describe("RequireDataStoreField.vue", () => {
  it("renders the title and description", () => {
    const wrapper = mountField(true);
    expect(wrapper.find(".settings-description-title").text()).toBe(
      "Require Data Store",
    );
    expect(wrapper.find(".setting-description-text").text()).toContain(
      "Toggle to control",
    );
  });

  it("reflects modelValue true in the toggle", () => {
    const wrapper = mountField(true);
    expect(wrapper.find(".mock-toggle").attributes("data-checked")).toBe("true");
  });

  it("reflects modelValue false in the toggle", () => {
    const wrapper = mountField(false);
    expect(wrapper.find(".mock-toggle").attributes("data-checked")).toBe(
      "false",
    );
  });

  it("emits false when clicked while true", async () => {
    const wrapper = mountField(true);
    await wrapper.find(".mock-toggle").trigger("click");
    expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
  });

  it("emits true when clicked while false", async () => {
    const wrapper = mountField(false);
    await wrapper.find(".mock-toggle").trigger("click");
    expect(wrapper.emitted("update:modelValue")).toEqual([[true]]);
  });
});
