import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ConfirmationEventBus from "primevue/confirmationeventbus";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import AutostartToggle from "~/components/projects/AutostartToggle.vue";
import { useNodeSettingsStore } from "~/stores/nodeSettingsStore";
import type { UserSettings } from "~/services/Api";

const PROJECT_ID = "7f2f3b59-3b6d-4fb6-a900-2a4d5c2ea483";
const PROJECT_NAME = "fake-project";

interface ConfirmOptions {
  group?: string;
  message?: string;
  header?: string;
  icon?: string;
  accept?: () => void;
  reject?: () => void;
  onHide?: () => void;
}

// Fires the parent's click listener before the model update, matching the real
// ToggleSwitch where the root click precedes the input's change event.
const ToggleSwitchStub = {
  props: ["modelValue", "disabled"],
  emits: ["click", "update:modelValue"],
  template:
    '<button class="mock-toggle" :disabled="disabled" :data-checked="String(modelValue)" @click="$emit(\'click\', $event); $emit(\'update:modelValue\', !modelValue)" />',
};

describe("AutostartToggle.vue", () => {
  let toastAdd: ReturnType<typeof vi.fn>;
  let confirmOptions: ConfirmOptions | undefined;

  beforeEach(() => {
    setActivePinia(createPinia());

    toastAdd = vi.fn();
    vi.mocked(useToast).mockReturnValue({ add: toastAdd } as never);

    confirmOptions = undefined;
    vi.mocked(useConfirm).mockReturnValue({
      require: (options: ConfirmOptions) => {
        confirmOptions = options;
      },
    } as never);
  });

  function seedStore(settings: UserSettings | null) {
    const store = useNodeSettingsStore();
    store.settings = settings;
    store.updateSettings = vi.fn().mockResolvedValue({}) as never;
    return store;
  }

  function mountToggle(projectName: string | null = PROJECT_NAME) {
    return mount(AutostartToggle, {
      props: { projectId: PROJECT_ID, projectName },
      global: {
        stubs: { ToggleSwitch: ToggleSwitchStub, ConfirmDialog: true },
      },
    });
  }

  const toggleState = (wrapper: ReturnType<typeof mountToggle>) =>
    wrapper.find(".mock-toggle").attributes("data-checked");

  describe("initial state", () => {
    it("uses the project's own setting when one exists", () => {
      seedStore({
        autostart: {
          default_project_autostart_policy: false,
          projects: { [PROJECT_ID]: true },
        },
      });

      expect(toggleState(mountToggle())).toBe("true");
    });

    it("prefers a disabled project setting over an enabled default", () => {
      seedStore({
        autostart: {
          default_project_autostart_policy: true,
          projects: { [PROJECT_ID]: false },
        },
      });

      expect(toggleState(mountToggle())).toBe("false");
    });

    it("falls back to the default policy when the project has no setting", () => {
      seedStore({
        autostart: {
          default_project_autostart_policy: true,
          projects: { "some-other-project": false },
        },
      });

      expect(toggleState(mountToggle())).toBe("true");
    });

    it("is off when settings have not loaded", () => {
      seedStore(null);

      expect(toggleState(mountToggle())).toBe("false");
    });

    it("dims the tag that does not match the current state", () => {
      seedStore({ autostart: { projects: { [PROJECT_ID]: true } } });
      const wrapper = mountToggle();

      expect(wrapper.find(".autostart-tag-enabled").classes()).not.toContain(
        "dimmed",
      );
      expect(wrapper.find(".autostart-tag-disabled").classes()).toContain(
        "dimmed",
      );
    });
  });

  describe("confirmation", () => {
    it("asks to enable autostart when the toggle is off", async () => {
      seedStore({ autostart: { projects: { [PROJECT_ID]: false } } });
      const wrapper = mountToggle();

      await wrapper.find(".mock-toggle").trigger("click");

      expect(confirmOptions?.header).toBe("Enable Autostart Confirmation");
      expect(confirmOptions?.message).toContain("automatically started");
    });

    it("asks to disable autostart when the toggle is on", async () => {
      seedStore({ autostart: { projects: { [PROJECT_ID]: true } } });
      const wrapper = mountToggle();

      await wrapper.find(".mock-toggle").trigger("click");

      expect(confirmOptions?.header).toBe("Disable Autostart Confirmation");
      expect(confirmOptions?.message).toContain("manually started");
    });

    // Every row renders its own ConfirmDialog, so an ungrouped confirmation
    // would open one dialog per project.
    it("targets a confirm dialog unique to the project", async () => {
      seedStore({ autostart: { projects: { [PROJECT_ID]: false } } });
      const wrapper = mountToggle();

      await wrapper.find(".mock-toggle").trigger("click");

      expect(confirmOptions?.group).toBe(`autostart-${PROJECT_ID}`);
      expect(
        wrapper.findComponent({ name: "ConfirmDialog" }).attributes("group"),
      ).toBe(`autostart-${PROJECT_ID}`);
    });

    it("does not save anything until the confirmation is accepted", async () => {
      const store = seedStore({
        autostart: { projects: { [PROJECT_ID]: false } },
      });
      const wrapper = mountToggle();

      await wrapper.find(".mock-toggle").trigger("click");
      await flushPromises();

      expect(store.updateSettings).not.toHaveBeenCalled();
    });

    it("resets the toggle when the confirmation is rejected", async () => {
      seedStore({ autostart: { projects: { [PROJECT_ID]: false } } });
      const wrapper = mountToggle();

      await wrapper.find(".mock-toggle").trigger("click");
      expect(toggleState(wrapper)).toBe("true");

      confirmOptions?.reject?.();
      await flushPromises();

      expect(toggleState(wrapper)).toBe("false");
    });

    it("resets the toggle when the dialog is dismissed", async () => {
      seedStore({ autostart: { projects: { [PROJECT_ID]: true } } });
      const wrapper = mountToggle();

      await wrapper.find(".mock-toggle").trigger("click");
      expect(toggleState(wrapper)).toBe("false");

      confirmOptions?.onHide?.();
      await flushPromises();

      expect(toggleState(wrapper)).toBe("true");
    });
  });

  describe("saving", () => {
    it("enables autostart for only this project on accept", async () => {
      const store = seedStore({
        autostart: { projects: { [PROJECT_ID]: false } },
      });
      const wrapper = mountToggle();

      await wrapper.find(".mock-toggle").trigger("click");
      confirmOptions?.accept?.();
      await flushPromises();

      expect(store.updateSettings).toHaveBeenCalledWith({
        autostart: { projects: { [PROJECT_ID]: true } },
      });
      expect(toggleState(wrapper)).toBe("true");
    });

    it("disables autostart for only this project on accept", async () => {
      const store = seedStore({
        autostart: { projects: { [PROJECT_ID]: true } },
      });
      const wrapper = mountToggle();

      await wrapper.find(".mock-toggle").trigger("click");
      confirmOptions?.accept?.();
      await flushPromises();

      expect(store.updateSettings).toHaveBeenCalledWith({
        autostart: { projects: { [PROJECT_ID]: false } },
      });
      expect(toggleState(wrapper)).toBe("false");
    });

    it("shows a success toast when the update succeeds", async () => {
      seedStore({ autostart: { projects: { [PROJECT_ID]: false } } });
      const wrapper = mountToggle();

      await wrapper.find(".mock-toggle").trigger("click");
      confirmOptions?.accept?.();
      await flushPromises();

      expect(toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "success",
          summary: "Update Success",
        }),
      );
    });

    it("shows an error toast when the update fails", async () => {
      const store = seedStore({
        autostart: { projects: { [PROJECT_ID]: false } },
      });
      vi.mocked(store.updateSettings).mockResolvedValue(null);
      const wrapper = mountToggle();

      await wrapper.find(".mock-toggle").trigger("click");
      confirmOptions?.accept?.();
      await flushPromises();

      expect(toastAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: "error",
          summary: "Update Failed",
        }),
      );
    });

    it("disables the toggle while an update is in flight", async () => {
      const store = seedStore({
        autostart: { projects: { [PROJECT_ID]: false } },
      });
      let resolveUpdate: (value: UserSettings) => void = () => {};
      vi.mocked(store.updateSettings).mockReturnValue(
        new Promise((resolve) => {
          resolveUpdate = resolve;
        }),
      );
      const wrapper = mountToggle();

      await wrapper.find(".mock-toggle").trigger("click");
      confirmOptions?.accept?.();
      await flushPromises();

      expect(wrapper.find(".mock-toggle").attributes("disabled")).toBeDefined();

      resolveUpdate({});
      await flushPromises();

      expect(
        wrapper.find(".mock-toggle").attributes("disabled"),
      ).toBeUndefined();
    });
  });

  describe("dialog message", () => {
    let wrapper: ReturnType<typeof mount> | undefined;

    beforeEach(() => {
      vi.mocked(useConfirm).mockReturnValue({
        require: (options: ConfirmOptions) =>
          ConfirmationEventBus.emit("confirm", options),
      } as never);
    });

    afterEach(() => {
      wrapper?.unmount();
      document.body.innerHTML = "";
    });

    async function openDialog(projectEnabled: boolean) {
      seedStore({ autostart: { projects: { [PROJECT_ID]: projectEnabled } } });
      wrapper = mount(AutostartToggle, {
        props: { projectId: PROJECT_ID, projectName: PROJECT_NAME },
        global: { stubs: { ToggleSwitch: ToggleSwitchStub } },
        attachTo: document.body,
      });

      await wrapper.find(".mock-toggle").trigger("click");
      await flushPromises();

      const message = document.body.querySelector(".autostart-confirm-message");
      expect(message).not.toBeNull();
      return message!;
    }

    it("puts the question and the consequence on separate lines", async () => {
      const message = await openDialog(false);

      const paragraphs = Array.from(message.querySelectorAll("p")).map((p) =>
        p.textContent?.replace(/\s+/g, " ").trim(),
      );
      expect(paragraphs).toEqual([
        `Are you sure you want to enable autostart for project ${PROJECT_NAME}?`,
        "All future analyses for this project will be automatically started as soon as this node receives the image.",
      ]);
    });

    it("highlights the project name when enabling", async () => {
      const message = await openDialog(false);

      const name = message.querySelector("b.autostart-confirm-project");
      expect(name?.textContent).toBe(PROJECT_NAME);
    });

    it("highlights the project name when disabling", async () => {
      const message = await openDialog(true);

      expect(message.querySelector("p")?.textContent).toContain(
        "disable autostart",
      );
      const name = message.querySelector("b.autostart-confirm-project");
      expect(name?.textContent).toBe(PROJECT_NAME);
    });
  });
});
