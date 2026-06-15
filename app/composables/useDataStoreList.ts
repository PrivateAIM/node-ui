import { ref, watchEffect } from "vue";
import { getDataStores, getProjects } from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
import type { ModifiedDetailedService } from "~/services/modifiedApiInterfaces";
import type { DetailedAnalysis, Project, Route } from "~/services/Api";

export function buildProjectNameMap(
  projects: Project[] | DetailedAnalysis[],
): Map<string, string | undefined> {
  const map = new Map<string, string | undefined>();
  projects.forEach((entry) => {
    if (entry.id) {
      map.set(entry.id, entry.display_name ?? "N/A");
    }
  });
  return map;
}

export function extractProjectIdFromPath(
  paths: string[] | null | undefined,
): string | undefined {
  const firstPath = paths?.[0];
  return firstPath?.split("/")[1];
}

const DATA_ROW_UNIX_COLS = ["created_at", "updated_at"];

export async function useDataStoreList() {
  const dataStores = ref<ModifiedDetailedService[]>([]);
  const projectNameMap = ref<Map<string, string | undefined>>(new Map());
  const loading = ref(true);

  const {
    data: dsResp,
    status: dsStatus,
    error: dsError,
    refresh,
  } = await getDataStores(true, { lazy: true });

  const { data: projectResp } = await getProjects({ lazy: true });

  watchEffect(() => {
    if (dsStatus.value === "pending") return;

    if (dsResp.value?.data && dsStatus.value === "success") {
      let formatted = formatDataRow(
        dsResp.value.data,
        DATA_ROW_UNIX_COLS,
        [],
      ) as ModifiedDetailedService[];

      formatted = formatted.filter((s) => s.name !== "kong-admin-service");

      formatted.forEach((store) => {
        if (store.routes) {
          store.routes = formatDataRow(
            store.routes,
            DATA_ROW_UNIX_COLS,
            [],
          ) as Route[];
          store.routes?.forEach((route: Route) => {
            route["projectId"] = extractProjectIdFromPath(route.paths);
          });
        }
      });

      dataStores.value = formatted;
    } else if (dsError.value?.statusCode === 500) {
      dataStores.value = [];
    }

    loading.value = false;
  });

  watchEffect(() => {
    if (projectResp.value) {
      projectNameMap.value = buildProjectNameMap(projectResp.value);
    }
  });

  return { dataStores, projectNameMap, loading, refresh };
}
