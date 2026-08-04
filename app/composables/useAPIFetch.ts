import type {
  AnalysisNode,
  ListServices,
  Project,
  ProjectNode,
  ServiceHealthHistory,
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

// Health endpoints
export function getServiceHealthHistory(
  query: {
    start_date?: string;
    end_date?: string;
    service?: string[];
    include_checks?: boolean;
    limit?: number;
    resolution?: number;
  } = {},
  opts?,
) {
  return useNuxtApp().$hubApi<ServiceHealthHistory>(
    "/health/services/history",
    {
      ...opts,
      method: "GET",
      query,
    },
  );
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

export function deleteDataStore(
  dataStoreIdOrName: string,
  cascade: boolean = false,
  opts?,
) {
  return useNuxtApp().$hubApi(`/kong/datastore/${dataStoreIdOrName}`, {
    ...opts,
    method: "DELETE",
    query: {
      cascade,
    },
  });
}

// Results endpoints
export function downloadLocalObject(objectId: string, opts?) {
  return useNuxtApp().$hubApi<Blob>(`/local/${objectId}`, {
    ...opts,
    method: "GET",
    headers: { "Content-Disposition": "application/octet-stream" },
    responseType: "blob",
  });
}

export function downloadIntermediateObject(objectId: string, opts?) {
  return useNuxtApp().$hubApi<Blob>(`/intermediate/${objectId}`, {
    ...opts,
    method: "GET",
    headers: { "Content-Disposition": "application/octet-stream" },
    responseType: "blob",
  });
}
