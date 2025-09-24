import type { NodeTypeResponse } from "~/services/Api";
import { useNuxtApp, useState } from "#app";

const cachedNodeType: string | null = null;

export async function useNodeType() {
  const nodeType = useState<string | null>("nodeType", () => cachedNodeType);

  if (!nodeType.value) {
    const nodeResp = (await useNuxtApp()
      .$hubApi("/node-type", {
        method: "GET",
      })
      .catch(() => null)) as NodeTypeResponse;
    if (nodeResp) {
      nodeType.value = nodeResp.type;
    }
  }

  return nodeType;
}
