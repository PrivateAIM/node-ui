// const { user } = useOidcAuth();
import { v4 as uuidv4 } from "uuid";

export const useAPIFetch: typeof useFetch = (request, opts?) => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.baseURL as string;

  return useFetch(request, {
    baseURL: baseUrl,
    // headers: {
    //   accept: "application/json",
    //   authorization: `Bearer ${user?.value.accessToken}`,
    // },
    ...opts,
  });
};

// Not working
export const approveRejectAnalysis = async (
  approved: boolean,
  analysis_id: string | undefined,
) => {
  return useAPIFetch(`/analysis-nodes/${analysis_id}`, {
    method: "POST",
    body: {
      approval_status: approved ? "approved" : "rejected",
    },
  });
};

// Not working
export const getAnalyses = async () => {
  return useAPIFetch("/analysis-nodes", {
    method: "GET",
  });
};

export const getSpecificAnalysis = async (
  analysisId: typeof uuidv4,
  filterId?: typeof uuidv4,
  filterNodeId?: typeof uuidv4,
  filterAnalysisId?: typeof uuidv4,
) => {
  return useAPIFetch(`/analysis-nodes/${analysisId}`, {
    method: "POST",
    body: {
      filter_id: filterId ? filterId : null,
      filter_node_id: filterNodeId ? filterNodeId : null,
      filter_analysis_id: filterAnalysisId ? filterAnalysisId : null,
    },
  });
};
