import type {
  AllAnalyses,
  AllProjects,
  BodyCreateAnalysisPoPost,
  BodyCreateAndConnectAnalysisToProjectKongAnalysisPost,
  BodyCreateAndConnectProjectToDatastoreKongProjectPost,
  DeleteProject,
  LinkDataStoreProject,
  LinkProjectAnalysis,
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
export function approveRejectProjectProposal(
  approved: boolean,
  project_id: string,
) {
  const formData = new FormData();
  formData.append("approval_status", approved ? "approved" : "rejected");

  return useAPIFetch(`/project-nodes/${project_id}`, {
    method: "POST",
    body: formData,
  });
}

export function getProposals() {
  return useAPIFetch<{ data: ListProjectNodes }>("/project-nodes", {
    method: "GET",
    query: { include: "project,node" },
  });
}

export function getProjects() {
  return useAPIFetch<{ data: AllProjects }>("/projects", {
    method: "GET",
  });
}

export function getAnalyses() {
  return useAPIFetch<{ data: AllAnalyses }>("/analyses", {
    method: "GET",
  });
}

// Kong endpoints
export function getDataStores(includeProject: boolean) {
  return useAPIFetch<{ data: ListServices }>("/kong/datastore", {
    method: "GET",
    query: {
      detailed: includeProject,
    },
  });
}

export function createDataStore(dataStoreProps: Service) {
  return useAPIFetch<{ data: Service }>(`/kong/datastore`, {
    method: "POST",
    body: dataStoreProps,
  });
}

export function deleteDataStore(dataStoreName: string) {
  return useAPIFetch(`/kong/datastore/${dataStoreName}`, {
    method: "DELETE",
  });
}

export function createProject(
  routeProps: BodyCreateAndConnectProjectToDatastoreKongProjectPost,
) {
  return useAPIFetch<{ data: LinkDataStoreProject }>(`/kong/project`, {
    method: "POST",
    body: routeProps,
  });
}

export function deleteProjectFromKong(projectId: string) {
  return useAPIFetch<{ data: DeleteProject }>(`/kong/project/${projectId}`, {
    method: "DELETE",
  });
}

export function connectAnalysisProject(
  consumerProps: BodyCreateAndConnectAnalysisToProjectKongAnalysisPost,
) {
  return useAPIFetch<{ data: LinkProjectAnalysis }>(`/kong/analysis`, {
    method: "POST",
    body: consumerProps,
  });
}

// PodOrc endpoints
export function startAnalysis(analysisProps: BodyCreateAnalysisPoPost) {
  return useAPIFetch(`/po`, {
    method: "POST",
    body: analysisProps,
  });
}

export function stopAnalysis(analysisId: string) {
  return useAPIFetch(`/po/${analysisId}/stop`, {
    method: "PUT",
  });
}

export function deleteAnalysis(analysisId: string) {
  return useAPIFetch(`/po/${analysisId}/delete`, {
    method: "DELETE",
  });
}

// Results endpoints
export function downloadLocalObject(objectId: string) {
  return useAPIFetch(`/local/${objectId}`, {
    method: "GET",
    headers: { "Content-Disposition": "application/octet-stream" },
  });
}
