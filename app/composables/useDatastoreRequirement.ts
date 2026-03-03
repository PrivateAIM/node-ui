import { type NodeTypeResponse, type UserSettings } from "~/services/Api";
import { useNuxtApp, useRoute, useState } from "nuxt/app";

interface DatastoreState {
  datastoreRequired: boolean | undefined | null;
  nodeType: string | undefined;
}

export async function useDatastoreRequirement() {
  const route = useRoute();

  const datastoreState = useState<DatastoreState>("datastoreRequired", () => ({
    datastoreRequired: undefined,
    nodeType: undefined,
  }));

  // If both populated then just return it
  if (datastoreState.value.datastoreRequired && datastoreState.value.nodeType) {
    return { datastoreState, setDatastoreRequired };
  }

  // Don't both trying to get it until they leave the landing page (which means they are authenticated)
  if (route.path !== "/") {
    let dataRequired: boolean = datastoreState.value.datastoreRequired || true; // Assume it's required if not set

    // If no setting for this requirement, fetch it
    if (datastoreState.value.datastoreRequired == undefined) {
      const nodeConfigResp = (await useNuxtApp()
        .$hubApi("/node/settings", {
          method: "GET",
        })
        .catch(() => undefined)) as UserSettings;
      if (nodeConfigResp) {
        dataRequired = Boolean(nodeConfigResp.require_data_store);
      }
    }

    // If node type not set, fetch it
    if (datastoreState.value.nodeType == undefined) {
      const nodeResp = (await useNuxtApp()
        .$hubApi("/node-type", {
          method: "GET",
        })
        .catch(() => undefined)) as NodeTypeResponse;
      if (nodeResp && nodeResp.type) {
        datastoreState.value.nodeType = nodeResp.type;
        datastoreState.value.datastoreRequired =
          nodeResp.type !== "aggregator" && dataRequired;
      }
    }
  }

  async function setDatastoreRequired(updatedRequirement: boolean) {
    const nodeConfigResp = (await useNuxtApp()
      .$hubApi("/node/settings", {
        method: "POST",
        body: { require_data_store: updatedRequirement },
      })
      .catch(() => undefined)) as UserSettings;
    if (nodeConfigResp) {
      datastoreState.value.datastoreRequired = Boolean(
        nodeConfigResp.require_data_store,
      );
    }
  }

  return { datastoreState, setDatastoreRequired };
}
