import { v4 as uuidv4 } from "uuid";
import type {
  AllProjects,
  ListAnalysisNodes,
  ListAnalysisOrProjectNodes,
  ListRoute200Response,
  Service,
} from "~/services/Api";

export const useAPIFetch: typeof useFetch = (request, options?) => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.baseURL as string;

  const { user } = useOidcAuth();

  return useFetch(request, {
    baseURL: baseUrl,
    onRequest({ options }) {
      // Annoying workaround to avoid typescript from complaining - cast to Headers then set explicitly
      const headers = options.headers
        ? new Headers(options.headers)
        : new Headers();
      headers.set("Authorization", `Bearer ${user?.value.accessToken}`);
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
      // console.log(response);
    },
    ...options,
  });
};

// Not working
export const approveRejectProjectProposal = async (
  approved: boolean,
  project_id: string | undefined,
) => {
  const formData = new FormData();
  formData.append("approval_status", approved ? "approved" : "rejected");

  return useAPIFetch(`/project-nodes/${project_id}`, {
    method: "POST",
    body: formData,
  });
};

export const getProposals = async () => {
  return useAPIFetch<{ data: ListAnalysisOrProjectNodes }>("/project-nodes", {
    method: "GET",
  });
};

export const getProjects = async () => {
  return useAPIFetch<{ data: AllProjects }>("/projects", {
    method: "GET",
  });
};

export const getAnalyses = async () => {
  return useAPIFetch<{ data: ListAnalysisNodes }>("/analysis-nodes", {
    method: "GET",
  });
};

export const getSpecificAnalysis = async (
  analysisId: typeof uuidv4,
  filterId?: typeof uuidv4,
  filterNodeId?: typeof uuidv4,
  filterAnalysisId?: typeof uuidv4,
) => {
  return useAPIFetch<{ data: ListAnalysisNodes }>(
    `/analysis-nodes/${analysisId}`,
    {
      method: "POST",
      body: {
        filter_id: filterId ? filterId : null,
        filter_node_id: filterNodeId ? filterNodeId : null,
        filter_analysis_id: filterAnalysisId ? filterAnalysisId : null,
      },
    },
  );
};

export const getDataStores = async () => {
  return useAPIFetch<{ data: ListRoute200Response }>("/kong/datastore", {
    method: "GET",
  });
};

export const createDataStore = async (dataStoreProps: Service) => {
  return useAPIFetch(`/kong/datastore`, {
    method: "POST",
    body: dataStoreProps,
  });
};

export const deleteDataStore = async (dataStoreName: string) => {
  return useAPIFetch(`/kong/datastore/${dataStoreName}`, {
    method: "DELETE",
  });
};
