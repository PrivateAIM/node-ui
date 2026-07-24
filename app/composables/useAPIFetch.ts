import type {
  AnalysisNode,
  BodyKongProjectLinkKongProjectProjectIdDatastoreDatastoreIdPost,
  DetailedAnalysis,
  EventLogResponse,
  LinkDataStoreProject,
  ListServices,
  Project,
  ProjectNode,
  UnlinkResponse,
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

export function deleteDataStore(
  dataStoreIdOrName: string,
  cascade: boolean = false,
  opts?,
) {
  return useAPIFetch(`/kong/datastore/${dataStoreIdOrName}`, {
    ...opts,
    method: "DELETE",
    query: {
      cascade,
    },
  });
}

export function linkProjectToDataStore(
  projectId: string,
  datastoreId: string,
  linkProps: BodyKongProjectLinkKongProjectProjectIdDatastoreDatastoreIdPost = {},
  opts?,
) {
  return useAPIFetch<LinkDataStoreProject>(
    `/kong/project/${projectId}/datastore/${datastoreId}`,
    {
      ...opts,
      method: "POST",
      body: linkProps,
    },
  );
}

export function deleteProjectFromKong(projectId: string, opts?) {
  return useAPIFetch<UnlinkResponse>(`/kong/project/${projectId}`, {
    ...opts,
    method: "DELETE",
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
