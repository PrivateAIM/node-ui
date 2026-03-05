import { useNodeSettingsStore } from "~/stores/nodeSettingsStore";
import { storeToRefs } from "pinia";

export function useDatastoreRequirement() {
  const store = useNodeSettingsStore();
  const { nodeType, requireDataStore } = storeToRefs(store);
  return { nodeType, requireDataStore };
}
