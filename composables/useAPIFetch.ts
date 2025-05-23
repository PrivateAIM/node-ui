import type {
  AllAnalyses,
  AllProjects,
  BodyCreateProjectAndConnectToDatastoreKongProjectPost,
  DeleteProject,
  LinkDataStoreProject,
  ListAnalysisNodes,
  ListConsumers,
  ListProjectNodes,
  ListServices,
  Service,
} from "~/services/Api";
import type { UseFetchOptions } from "#app";
import { useFetch, useNuxtApp } from "#app";

export function useAPIFetch<T>(
  request: string | (() => string),
  options: UseFetchOptions<T> = {},
) {
  return useFetch(request, {
    ...options,
    $fetch: useNuxtApp().$hubApi,
  });
}

// Hub endpoints
export function getProjectNodes(opts?) {
  return useAPIFetch<ListProjectNodes>("/project-nodes", {
    ...opts,
    method: "GET",
    query: {
      include: "project,node",
      sort: "-updated_at",
    },
  });
}

export function getProjects(opts?) {
  return useAPIFetch<AllProjects>("/projects", {
    ...opts,
    method: "GET",
    query: {
      sort: "-updated_at",
    },
  });
}

export function getAnalyses(opts?) {
  return useAPIFetch<AllAnalyses>("/analyses", {
    ...opts,
    method: "GET",
    query: {
      sort: "-updated_at",
    },
  });
}

export function getAnalysisNodes(opts?) {
  return useAPIFetch<ListAnalysisNodes>(
    "/analysis-nodes?include=analysis,node",
    {
      ...opts,
      method: "GET",
      query: {
        sort: "-updated_at",
      },
    },
  );
}

// Kong endpoints
export function getDataStores(includeProject: boolean, opts?) {
  return useAPIFetch<ListServices>("/kong/datastore", {
    ...opts,
    method: "GET",
    query: {
      detailed: includeProject,
    },
  });
}

export function createDataStore(dataStoreProps: Service, opts?) {
  return useAPIFetch<{ data: Service }>(`/kong/datastore`, {
    ...opts,
    method: "POST",
    body: dataStoreProps,
  });
}

export function deleteDataStore(dataStoreName: string, opts?) {
  return useAPIFetch(`/kong/datastore/${dataStoreName}`, {
    ...opts,
    method: "DELETE",
  });
}

export function createProject(
  routeProps: BodyCreateProjectAndConnectToDatastoreKongProjectPost,
  opts?,
) {
  return useAPIFetch<{ data: LinkDataStoreProject }>(`/kong/project`, {
    ...opts,
    method: "POST",
    body: routeProps,
  });
}

export function deleteProjectFromKong(projectId: string, opts?) {
  return useAPIFetch<{ data: DeleteProject }>(`/kong/project/${projectId}`, {
    ...opts,
    method: "DELETE",
  });
}

export function getAnalysesFromKong(opts?) {
  return useAPIFetch<ListConsumers>(`/kong/analysis`, {
    ...opts,
    method: "GET",
  });
}

export function deleteAnalysisFromKong(analysisId: string, opts?) {
  return useAPIFetch<{ data: DeleteProject }>(`/kong/analysis/${analysisId}`, {
    ...opts,
    method: "DELETE",
  });
}

// PodOrc endpoints
export function getAnalysisLogs(analysisId: string, opts?) {
  return useAPIFetch(`/po/${analysisId}/logs`, {
    ...opts,
    method: "GET",
  });
}

// Results endpoints
export function downloadLocalObject(objectId: string, opts?) {
  return useAPIFetch(`/local/${objectId}`, {
    ...opts,
    method: "GET",
    headers: { "Content-Disposition": "application/octet-stream" },
  });
}

export function downloadIntermediateObject(objectId: string, opts?) {
  return useAPIFetch(`/intermediate/${objectId}`, {
    ...opts,
    method: "GET",
    headers: { "Content-Disposition": "application/octet-stream" },
  });
}
