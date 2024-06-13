const { user } = useOidcAuth();

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

export const getAnalyses = async () => {
  return useAPIFetch(`/analysis-nodes`, {
    method: "POST",
  });
};
