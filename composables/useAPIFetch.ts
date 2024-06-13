const { user } = useOidcAuth();
import { v4 as uuidv4 } from "uuid";
import { type ListAnalysisNodes } from "~/services/Api";

export const useAPIFetch: typeof useFetch = (request, opts?) => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.baseURL as string;

  return useFetch(request, {
    baseURL: baseUrl,
    headers: {
      accept: "application/json",
      authorization: `Bearer ${user.value.accessToken}`,
    },
    ...opts,
  });
};

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

export const getAnalyses = async (
  filterId?: typeof uuidv4,
  filterNodeId?: typeof uuidv4,
  filterAnalysisId?: typeof uuidv4,
) => {
  return useAPIFetch(`/analysis-nodes`, {
    method: "GET",
    body: {
      filter_id: filterId ? filterId : null,
      filter_node_id: filterNodeId ? filterNodeId : null,
      filter_analysis_id: filterAnalysisId ? filterAnalysisId : null,
    },
  });
};
