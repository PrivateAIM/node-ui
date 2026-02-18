import { type NodeSettings, type NodeTypeResponse } from "~/services/Api";
import { useNuxtApp, useState } from "#app";

interface DatastoreState {
  datastoreRequired: boolean | null | undefined;
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
    const nodeConfigResp = (await useNuxtApp()
      .$hubApi("/node/settings", { method: "GET" })
      .catch(() => null)) as NodeSettings;
    if (nodeConfigResp) {
      dataRequired = Boolean(nodeConfigResp.data_required);
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

  async function setDatastoreRequired(updatedRequirement: boolean) {
    const nodeConfigResp = (await useNuxtApp()
      .$hubApi("/node/settings", {
        method: "POST",
        body: { data_required: updatedRequirement },
      })
      .catch(() => null)) as NodeSettings;

    if (nodeConfigResp) {
      datastoreState.value = {
        ...datastoreState.value,
        datastoreRequired: nodeConfigResp.data_required,
      };
    }
  }

  return { datastoreState, setDatastoreRequired };
}
