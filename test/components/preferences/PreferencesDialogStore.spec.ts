import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import PreferencesDialog from "~/components/preferences/PreferencesDialog.vue";
import { useNodeSettingsStore } from "~/stores/nodeSettingsStore";
import type { UserSettings } from "~/services/Api";

const DialogStub = {
  props: ["visible", "header", "modal", "style"],
  template: '<div v-if="visible" class="dialog-stub"><slot /></div>',
};

const RequireDataStoreFieldStub = {
  name: "RequireDataStoreField",
  props: ["modelValue", "disabled"],
  emits: ["update:modelValue"],
  template:
    '<button class="require-datastore-stub" :data-value="String(modelValue)" :data-disabled="String(disabled)" @click="$emit(\'update:modelValue\', !modelValue)" />',
};

const AutostartFieldStub = {
  name: "AutostartField",
  props: ["modelValue"],
  emits: ["update:modelValue"],
  template:
    '<div class="autostart-stub" :data-enabled="String(modelValue.enabled)" :data-interval="String(modelValue.interval)" />',
};

const globalStubs = {
  teleport: true,
  Dialog: DialogStub,
  RequireDataStoreField: RequireDataStoreFieldStub,
  AutostartField: AutostartFieldStub,
  Divider: true,
};

describe("PreferencesDialog.vue + nodeSettingsStore", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  function seedStore(nodeType: string, settings: UserSettings) {
    const store = useNodeSettingsStore();
    store.settings = settings;
    store.nodeType = nodeType;
    store.updateSettings = vi.fn(async (patch: UserSettings) => {
      store.settings = JSON.parse(JSON.stringify(patch));
      return store.settings;
    }) as never;
    return store;
  }

  async function toggleSaveAndReopen(wrapper: ReturnType<typeof mount>) {
    await wrapper.find(".require-datastore-stub").trigger("click");
    await wrapper.find(".preferences-update-btn button").trigger("click");
    await flushPromises();

    await wrapper.setProps({ preferencesVisible: false });
    await wrapper.setProps({ preferencesVisible: true });
    await flushPromises();
  }

  it("keeps the saved require_data_store value on a default node", async () => {
    const store = seedStore("default", {
      require_data_store: true,
      autostart: { enabled: false, interval: 60 },
    });

    const wrapper = mount(PreferencesDialog, {
      props: { preferencesVisible: true },
      global: { stubs: globalStubs },
    });

    await toggleSaveAndReopen(wrapper);

    expect(store.settings?.require_data_store).toBe(false);
    expect(
      wrapper.find(".require-datastore-stub").attributes("data-value"),
    ).toBe("false");
  });

  // The field is read-only on aggregator nodes, but it must still show what is
  // stored rather than the aggregator-overridden effective value.
  it("shows the stored require_data_store value on an aggregator node", async () => {
    seedStore("aggregator", {
      require_data_store: true,
      autostart: { enabled: false, interval: 60 },
    });

    const wrapper = mount(PreferencesDialog, {
      props: { preferencesVisible: false },
      global: { stubs: globalStubs },
    });

    await wrapper.setProps({ preferencesVisible: true });
    await flushPromises();

    expect(
      wrapper.find(".require-datastore-stub").attributes("data-value"),
    ).toBe("true");
  });

  it("still reports no datastore requirement for aggregator consumers", () => {
    const store = seedStore("aggregator", {
      require_data_store: true,
      autostart: { enabled: false, interval: 60 },
    });

    expect(store.requireDataStore).toBe(false);
    expect(store.requireDataStoreSetting).toBe(true);
  });

  it("leaves the require_data_store field editable on a default node", () => {
    seedStore("default", { require_data_store: true });

    const wrapper = mount(PreferencesDialog, {
      props: { preferencesVisible: true },
      global: { stubs: globalStubs },
    });

    expect(
      wrapper.find(".require-datastore-stub").attributes("data-disabled"),
    ).toBe("false");
  });

  it("disables the require_data_store field on an aggregator node", () => {
    seedStore("aggregator", { require_data_store: true });

    const wrapper = mount(PreferencesDialog, {
      props: { preferencesVisible: true },
      global: { stubs: globalStubs },
    });

    expect(
      wrapper.find(".require-datastore-stub").attributes("data-disabled"),
    ).toBe("true");
  });

  describe("when settings have not loaded yet", () => {
    function seedUnloaded() {
      const store = useNodeSettingsStore();
      store.settings = null;
      store.nodeType = "default";
      store.updateSettings = vi.fn(async (patch: UserSettings) => {
        store.settings = JSON.parse(JSON.stringify(patch));
        return store.settings;
      }) as never;
      return store;
    }

    it("cannot be saved before the settings arrive", async () => {
      seedUnloaded();

      const wrapper = mount(PreferencesDialog, {
        props: { preferencesVisible: true },
        global: { stubs: globalStubs },
      });

      const button = wrapper.find(".preferences-update-btn button");
      expect(button.attributes("disabled")).toBeDefined();
    });

    it("re-seeds the drafts when settings arrive while the dialog is open", async () => {
      const store = seedUnloaded();

      const wrapper = mount(PreferencesDialog, {
        props: { preferencesVisible: false },
        global: { stubs: globalStubs },
      });
      await wrapper.setProps({ preferencesVisible: true });
      await flushPromises();

      store.settings = {
        require_data_store: false,
        autostart: { enabled: true, interval: 30 },
      };
      await flushPromises();

      expect(
        wrapper.find(".require-datastore-stub").attributes("data-value"),
      ).toBe("false");
      const autostart = wrapper.find(".autostart-stub");
      expect(autostart.attributes("data-enabled")).toBe("true");
      expect(autostart.attributes("data-interval")).toBe("30");
    });

    it("saves the loaded values, not the pre-load defaults", async () => {
      const store = seedUnloaded();

      const wrapper = mount(PreferencesDialog, {
        props: { preferencesVisible: true },
        global: { stubs: globalStubs },
      });

      store.settings = {
        require_data_store: false,
        autostart: { enabled: true, interval: 30 },
      };
      await flushPromises();

      await wrapper.find(".preferences-update-btn button").trigger("click");
      await flushPromises();

      expect(store.updateSettings).toHaveBeenCalledWith({
        require_data_store: false,
        autostart: { enabled: true, interval: 30 },
      });
    });
  });

  it("does not discard in-progress edits when a background refetch lands", async () => {
    const store = seedStore("default", {
      require_data_store: true,
      autostart: { enabled: false, interval: 60 },
    });

    const wrapper = mount(PreferencesDialog, {
      props: { preferencesVisible: true },
      global: { stubs: globalStubs },
    });

    await wrapper.find(".require-datastore-stub").trigger("click"); // user edits

    // A periodic session refresh re-runs fetchSettings and replaces `settings`.
    store.settings = {
      require_data_store: true,
      autostart: { enabled: false, interval: 60 },
    };
    await flushPromises();

    expect(
      wrapper.find(".require-datastore-stub").attributes("data-value"),
    ).toBe("false");
  });
});
