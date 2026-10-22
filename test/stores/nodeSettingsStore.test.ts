import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { useNodeSettingsStore } from "~/stores/nodeSettingsStore";

describe("nodeSettingsStore autostart getters", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("autostartDefaultPolicy", () => {
    it("is false before settings load", () => {
      const store = useNodeSettingsStore();

      expect(store.autostartDefaultPolicy).toBe(false);
    });

    it("is false when the backend omits the field", () => {
      const store = useNodeSettingsStore();
      store.settings = { autostart: { enabled: true, interval: 60 } };

      expect(store.autostartDefaultPolicy).toBe(false);
    });

    it("reflects the stored policy", () => {
      const store = useNodeSettingsStore();
      store.settings = {
        autostart: { default_project_autostart_policy: true },
      };

      expect(store.autostartDefaultPolicy).toBe(true);
    });
  });

  describe("projectAutostartSettings", () => {
    it("is empty before settings load", () => {
      const store = useNodeSettingsStore();

      expect(store.projectAutostartSettings).toEqual({});
    });

    it("is empty when autostart settings are null", () => {
      const store = useNodeSettingsStore();
      store.settings = { autostart: null };

      expect(store.projectAutostartSettings).toEqual({});
    });

    it("returns the per-project settings", () => {
      const store = useNodeSettingsStore();
      store.settings = {
        autostart: { projects: { "project-a": true, "project-b": false } },
      };

      expect(store.projectAutostartSettings).toEqual({
        "project-a": true,
        "project-b": false,
      });
    });
  });
});
