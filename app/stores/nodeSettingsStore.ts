import { defineStore } from "pinia";
import type { NodeTypeResponse, UserSettings } from "~/services/Api";
import { useNuxtApp } from "nuxt/app";

export const useNodeSettingsStore = defineStore("nodeSettings", {
  state: () => ({
    settings: null as UserSettings | null,
    nodeType: null as string | null,
  }),
  getters: {
    requireDataStoreSetting(state): boolean {
      return Boolean(state.settings?.require_data_store ?? true);
    },
    requireDataStore(state): boolean {
      if (state.nodeType === "aggregator") return false;
      return this.requireDataStoreSetting;
    },
    autostartEnabled(state): boolean {
      return Boolean(state.settings?.autostart?.enabled ?? false);
    },
    autostartInterval(state): number {
      return state.settings?.autostart?.interval ?? 60;
    },
  },
  actions: {
    async fetchSettings() {
      const { $hubApi } = useNuxtApp();

      const [settingsResp, nodeTypeResp] = await Promise.all([
        $hubApi("/node/settings", { method: "GET" }).catch(
          () => null,
        ) as Promise<UserSettings | null>,
        $hubApi("/node-type", { method: "GET" }).catch(
          () => null,
        ) as Promise<NodeTypeResponse | null>,
      ]);

      if (settingsResp) {
        this.settings = settingsResp;
      }
      if (nodeTypeResp?.type) {
        this.nodeType = nodeTypeResp.type;
      }
    },

    async updateSettings(patch: UserSettings) {
      const { $hubApi } = useNuxtApp();

      const updated = (await $hubApi("/node/settings", {
        method: "POST",
        body: patch,
      }).catch(() => null)) as UserSettings | null;

      if (updated) {
        this.settings = updated;
      }

      return updated;
    },
  },
});
