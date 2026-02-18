import { type NodeTypeResponse } from "~/services/Api";
import { useNuxtApp, useState } from "#app";
import { getNodeConfiguration } from "~/composables/useAPIFetch";

interface DatastoreState {
  datastoreRequired: boolean | null;
  nodeType: string | null;
}

export async function useDatastoreRequirement() {
  const datastoreState = useState<DatastoreState>("datastoreRequired", () => ({
    datastoreRequired: null,
    nodeType: null,
  }));

  let dataRequired: boolean = true;

  // Get node configuration settings
  if (!datastoreState.value.datastoreRequired) {
    const { data: nodeConfig } = await getNodeConfiguration();
    if (nodeConfig.value) {
      dataRequired = Boolean(nodeConfig.value.data_required);
    }
  }

  if (!datastoreState.value.nodeType) {
    // Re-fetch if node type couldn't be obtained previously
    const nodeResp = (await useNuxtApp()
      .$hubApi("/node-type", { method: "GET" })
      .catch(() => null)) as NodeTypeResponse;

    if (nodeResp) {
      datastoreState.value = {
        nodeType: nodeResp.type,
        datastoreRequired: nodeResp.type !== "aggregator" && dataRequired,
      };
    }
  }

  function setDatastoreRequired(value: boolean) {
    datastoreState.value = {
      ...datastoreState.value,
      datastoreRequired: value,
    };
  }

  return { datastoreState, setDatastoreRequired };
}
