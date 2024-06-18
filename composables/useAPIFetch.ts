import { v4 as uuidv4 } from "uuid";
import type { ListAnalysisNodes } from "~/services/Api";

export const useAPIFetch: typeof useFetch = (request, options?) => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.baseURL as string;

  const { user } = useOidcAuth();

  return useFetch(request, {
    baseURL: baseUrl,
    onRequest({ options }) {
      // Set the request headers
      options.headers = options.headers || {};
      options.headers.authorization = `Bearer ${user?.value.accessToken}`;
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
      console.log(response.status);
      console.log(response);
    },
    ...options,
  });
};

// Not working
export const approveRejectProjectProposal = async (
  approved: boolean,
  project_id: string | undefined,
) => {
  return useAPIFetch(`/project-nodes/${project_id}`, {
    method: "POST",
    body: {
      approval_status: approved ? "approved" : "rejected",
    },
  });
};

export const getProposals = async () => {
  return useAPIFetch<{ data: ListAnalysisNodes }>("/project-nodes", {
    method: "GET",
  });
};

export const getProjects = async () => {
  return useAPIFetch<{ data: ListAnalysisNodes }>("/projects", {
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
