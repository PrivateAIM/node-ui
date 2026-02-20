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

  let dataRequired: boolean = datastoreState.value.datastoreRequired || true; // Assume it's required if not set

  // If no setting for this requirement, fetch it
  if (datastoreState.value.datastoreRequired == null) {
    const nodeConfigResp = (await useNuxtApp()
      .$hubApi("/node/settings", {
        method: "GET",
      })
      .catch(() => null)) as NodeSettings;
    if (nodeConfigResp) {
      dataRequired = Boolean(nodeConfigResp.data_required);
    }
  }

  // If node type not set, fetch it
  if (datastoreState.value.nodeType == null) {
    const nodeResp = (await useNuxtApp()
      .$hubApi("/node-type", {
        method: "GET",
      })
      .catch(() => null)) as NodeTypeResponse;
    if (nodeResp && nodeResp.type) {
      datastoreState.value.nodeType = nodeResp.type;
      datastoreState.value.datastoreRequired =
        nodeResp.type !== "aggregator" && dataRequired;
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
      datastoreState.value.datastoreRequired = Boolean(
        nodeConfigResp.data_required,
      );
    }
  }

  return { datastoreState, setDatastoreRequired };
}
