import type {
  AnalysisLogsResponse,
  AnalysisNode,
  DeleteProject,
  DetailedAnalysis,
  EventLogResponse,
  LinkDataStoreProject,
  ListConsumers,
  ListRoutes,
  ListServices,
  Project,
  ProjectNode,
  Service,
  UserSettings,
} from "~/services/Api";

import { useFetch, type UseFetchOptions, useNuxtApp } from "nuxt/app";

export function useAPIFetch<T>(
  request: string | (() => string),
  options: UseFetchOptions<T> = {},
) {
  return useFetch(request, {
    ...options,
    $fetch: useNuxtApp().$hubApi as typeof $fetch,
  });
}

// Event endpoints
export function getEvents(
  query: {
    limit?: number;
    offset?: number;
    start_date?: string;
    end_date?: string;
    service_tag?: string;
  } = {},
  opts?,
) {
  return useAPIFetch<EventLogResponse>("/events", {
    ...opts,
    method: "GET",
    query: {
      limit: 50,
      ...query,
    },
  });
}

// Node endpoints
export function getNodeConfiguration(opts?) {
  return useAPIFetch<UserSettings>("/node/settings", {
    ...opts,
    method: "GET",
  });
}

// Hub endpoints
export function getProjectNodes(opts?) {
  return useAPIFetch<ProjectNode[]>("/project-nodes", {
    ...opts,
    method: "GET",
    query: {
      include: "project,node",
      sort: "-updated_at",
    },
  });
}

export function getProjects(opts?) {
  return useAPIFetch<Project[]>("/projects", {
    ...opts,
    method: "GET",
    query: {
      sort: "-updated_at",
    },
  });
}

export function getAnalyses(opts?) {
  return useAPIFetch<DetailedAnalysis[]>("/analyses", {
    ...opts,
    method: "GET",
    query: {
      sort: "-updated_at",
    },
  });
}

export function getAnalysisNodes(opts?) {
  return useAPIFetch<AnalysisNode[] | undefined>(
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

export function createProject(routeProps: ListRoutes, opts?) {
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
  return useAPIFetch<AnalysisLogsResponse>(`/logs/${analysisId}`, {
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
