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
import { useServices } from "~/composables/useServices";

export const useAPIFetch: typeof useFetch = (request, options?) => {
  const config = useRuntimeConfig();
  const nuxtApp = useNuxtApp();
  const baseUrl = config.public.hubAdapterUrl as string;

  const services = useServices();

  const token = services.$application.getToken();

  return useFetch(request, {
    baseURL: baseUrl,
    onRequest({ options }) {
      // Annoying workaround to avoid typescript from complaining - cast to Headers then set explicitly
      const headers = options.headers
        ? new Headers(options.headers)
        : new Headers();
      headers.set("Authorization", `Bearer ${token}`);
      options.headers = headers;
    },
    onRequestError({ request, options, error }) {
      console.log(request);
      console.log(options);
      console.log(error);
    },
    onResponse({ response }) {
      // Process the response data
      localStorage.setItem("token", response._data.token);
    },
    onResponseError({ response }) {
      // Handle the response errors
      console.log(response);
      if (response.status === 401 || response.status === 403) {
        console.log("User signed out, routing to login");
        nuxtApp.runWithContext(() => navigateTo("/"));
      }
    },
    ...options,
  });
};

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

export function getProposals(opts?) {
  return useAPIFetch<{ data: ListProjectNodes }>("/project-nodes", {
    ...opts,
    method: "GET",
    query: { include: "project,node" },
  });
}

export function getProjects(opts?) {
  return useAPIFetch<{ data: AllProjects }>("/projects", {
    ...opts,
    method: "GET",
  });
}

export function getAnalyses(opts?) {
  return useAPIFetch<{ data: AllAnalyses }>("/analyses", {
    ...opts,
    method: "GET",
  });
}

export function getAnalysisNodes(opts?) {
  return useAPIFetch<{ data: ListAnalysisNodes }>(
    "/analysis-nodes?include=analysis",
    {
      ...opts,
      method: "GET",
    },
  );
}

export function updateAnalysis(analysis_id: string, updates) {
  // const formData = new FormData();
  // formData.append("approval_status", approved ? "approved" : "rejected");

  return useAPIFetch(`/analyses/${analysis_id}`, {
    method: "POST",
    body: updates,
  });
}

// Kong endpoints
export function getDataStores(includeProject: boolean, opts?) {
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
