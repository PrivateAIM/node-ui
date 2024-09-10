import type {
  AllAnalyses,
  AllProjects,
  BodyCreateAnalysisPoPost,
  BodyCreateAndConnectAnalysisToProjectKongAnalysisPost,
  BodyCreateAndConnectProjectToDatastoreKongProjectPost,
  CreatePodResponse,
  DeleteProject,
  LinkDataStoreProject,
  LinkProjectAnalysis,
  ListAnalysisNodes,
  ListConsumers,
  ListProjectNodes,
  ListServices,
  Service,
} from "~/services/Api";
import type { UseFetchOptions } from "#app";

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
export function getProposals(opts?) {
  return useAPIFetch<{ data: ListProjectNodes }>("/project-nodes", {
    ...opts,
    method: "GET",
    query: {
      include: "project,node",
      sort: "-updated_at",
    },
  });
}

export function getProjects(opts?) {
  return useAPIFetch<{ data: AllProjects }>("/projects", {
    ...opts,
    method: "GET",
    query: {
      sort: "-updated_at",
    },
  });
}

export function getAnalyses(opts?) {
  return useAPIFetch<{ data: AllAnalyses }>("/analyses", {
    ...opts,
    method: "GET",
    query: {
      sort: "-updated_at",
    },
  });
}

export function getSpecificAnalysis(analysis_id: string, opts?) {
  return useAPIFetch<{ data: Analysis }>(`/analyses/${analysis_id}`, {
    ...opts,
    method: "GET",
  });
}

export function getAnalysisNodes(opts?) {
  return useAPIFetch<{ data: ListAnalysisNodes }>(
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
  // return nuxtApp.$hubApi("/kong/datastore", {
  //   ...opts,
  //   method: "GET",
  //   query: {
  //     detailed: includeProject,
  //   },
  // });
  return useAPIFetch<{ data: ListServices }>("/kong/datastore", {
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
  routeProps: BodyCreateAndConnectProjectToDatastoreKongProjectPost,
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
  return useAPIFetch<{ data: ListConsumers }>(`/kong/analysis`, {
    ...opts,
    method: "GET",
  });
}

export function connectAnalysisProject(
  consumerProps: BodyCreateAndConnectAnalysisToProjectKongAnalysisPost,
  opts?,
) {
  return useAPIFetch<{ data: LinkProjectAnalysis }>(`/kong/analysis`, {
    ...opts,
    method: "POST",
    body: consumerProps,
  });
}

export function deleteAnalysisFromKong(analysisId: string, opts?) {
  return useAPIFetch<{ data: DeleteProject }>(`/kong/analysis/${analysisId}`, {
    ...opts,
    method: "DELETE",
  });
}

// PodOrc endpoints
export function startAnalysis(analysisProps: BodyCreateAnalysisPoPost, opts?) {
  return useAPIFetch<{ data: CreatePodResponse }>(`/po`, {
    ...opts,
    method: "POST",
    body: analysisProps,
  });
}

export function stopAnalysis(analysisId: string, opts?) {
  return useAPIFetch<{ data: CreatePodResponse }>(`/po/${analysisId}/stop`, {
    ...opts,
    method: "PUT",
  });
}

export function deleteAnalysis(analysisId: string, opts?) {
  return useAPIFetch<{ data: CreatePodResponse }>(`/po/${analysisId}/delete`, {
    ...opts,
    method: "DELETE",
  });
}

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
