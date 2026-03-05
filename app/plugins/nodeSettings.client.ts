import { useNodeSettingsStore } from "~/stores/nodeSettingsStore";

export default defineNuxtPlugin(() => {
  const { status } = useAuthState();
  const nodeSettingsStore = useNodeSettingsStore();

  watch(
    status,
    (newStatus) => {
      if (newStatus === "authenticated") {
        nodeSettingsStore.fetchSettings();
      }
    },
    { immediate: true },
  );
});
