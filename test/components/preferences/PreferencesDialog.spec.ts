import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useToast } from "primevue/usetoast";
import PreferencesDialog from "~/components/preferences/PreferencesDialog.vue";
import { useNodeSettingsStore } from "~/stores/nodeSettingsStore";
import type { UserSettings } from "~/services/Api";

vi.mock("~/stores/nodeSettingsStore", () => ({
  useNodeSettingsStore: vi.fn(),
}));

// Renders slot content when visible — avoids PrimeVue Dialog's teleport complexity
const DialogStub = {
  props: ["visible", "header", "modal", "style"],
  template: '<div v-if="visible" class="dialog-stub"><slot /></div>',
};

const RequireDataStoreFieldStub = {
  name: "RequireDataStoreField",
  props: ["modelValue"],
  emits: ["update:modelValue"],
  template:
    '<div class="require-datastore-stub" :data-value="String(modelValue)" />',
};

const AutostartFieldStub = {
  name: "AutostartField",
  props: ["modelValue"],
  emits: ["update:modelValue"],
  template: '<div class="autostart-stub" />',
};

const globalStubs = {
  teleport: true,
  Dialog: DialogStub,
  RequireDataStoreField: RequireDataStoreFieldStub,
  AutostartField: AutostartFieldStub,
  Divider: true,
};

const defaultSettingsResponse: UserSettings = {
  require_data_store: true,
  autostart: { enabled: false, interval: 60 },
};

describe("PreferencesDialog.vue", () => {
  let mockUpdateSettings: ReturnType<typeof vi.fn>;
  let mockToast: { add: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockToast = { add: vi.fn() };
    vi.mocked(useToast).mockReturnValue(
      mockToast as unknown as ReturnType<typeof useToast>,
    );

    mockUpdateSettings = vi.fn().mockResolvedValue(defaultSettingsResponse);
    vi.mocked(useNodeSettingsStore).mockReturnValue({
      requireDataStore: true,
      autostartEnabled: false,
      autostartInterval: 60,
      updateSettings: mockUpdateSettings,
    } as unknown as ReturnType<typeof useNodeSettingsStore>);
  });

  it("renders dialog content when visible", () => {
    const wrapper = mount(PreferencesDialog, {
      props: { preferencesVisible: true },
      global: { stubs: globalStubs },
    });
    expect(wrapper.find(".dialog-stub").exists()).toBe(true);
  });

  it("hides dialog content when not visible", () => {
    const wrapper = mount(PreferencesDialog, {
      props: { preferencesVisible: false },
      global: { stubs: globalStubs },
    });
    expect(wrapper.find(".dialog-stub").exists()).toBe(false);
  });

  it("initializes RequireDataStoreField from store value", () => {
    const wrapper = mount(PreferencesDialog, {
      props: { preferencesVisible: true },
      global: { stubs: globalStubs },
    });
    expect(
      wrapper.find(".require-datastore-stub").attributes("data-value"),
    ).toBe("true");
  });

  it("initializes RequireDataStoreField as false when store has false", () => {
    vi.mocked(useNodeSettingsStore).mockReturnValue({
      requireDataStore: false,
      autostartEnabled: true,
      autostartInterval: 30,
      updateSettings: mockUpdateSettings,
    } as unknown as ReturnType<typeof useNodeSettingsStore>);

    const wrapper = mount(PreferencesDialog, {
      props: { preferencesVisible: true },
      global: { stubs: globalStubs },
    });
    expect(
      wrapper.find(".require-datastore-stub").attributes("data-value"),
    ).toBe("false");
  });

  it("calls updateSettings with correct values on submit", async () => {
    const wrapper = mount(PreferencesDialog, {
      props: { preferencesVisible: true },
      global: { stubs: globalStubs },
    });

    await wrapper.find(".preferences-update-btn button").trigger("click");
    await flushPromises();

    expect(mockUpdateSettings).toHaveBeenCalledWith({
      require_data_store: true,
      autostart: { enabled: false, interval: 60 },
    });
  });

  it("shows success toast after a successful update", async () => {
    const wrapper = mount(PreferencesDialog, {
      props: { preferencesVisible: true },
      global: { stubs: globalStubs },
    });

    await wrapper.find(".preferences-update-btn button").trigger("click");
    await flushPromises();

    expect(mockToast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "success",
        summary: "Update Success",
      }),
    );
  });

  it("shows error toast when update fails", async () => {
    mockUpdateSettings.mockResolvedValue(null);

    const wrapper = mount(PreferencesDialog, {
      props: { preferencesVisible: true },
      global: { stubs: globalStubs },
    });

    await wrapper.find(".preferences-update-btn button").trigger("click");
    await flushPromises();

    expect(mockToast.add).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: "error",
        summary: "Update Failed",
      }),
    );
  });

  it("resets draft values from the store when the dialog reopens", async () => {
    vi.mocked(useNodeSettingsStore).mockReturnValue({
      requireDataStore: false,
      autostartEnabled: true,
      autostartInterval: 30,
      updateSettings: mockUpdateSettings,
    } as unknown as ReturnType<typeof useNodeSettingsStore>);

    const wrapper = mount(PreferencesDialog, {
      props: { preferencesVisible: false },
      global: { stubs: globalStubs },
    });

    await wrapper.setProps({ preferencesVisible: true });
    await flushPromises();

    expect(
      wrapper.find(".require-datastore-stub").attributes("data-value"),
    ).toBe("false");
  });
});
