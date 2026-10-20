import { ref } from "vue";
import { useNuxtApp } from "nuxt/app";
import {
  fetchAllAnalysisNodes,
  fetchDataStoreProjectIds,
  fetchExecutionStatuses,
  type HubFetch,
  mergeExecutionStatuses,
} from "~/utils/project-analysis-data";
import {
  emptyProjectAnalysisSummary,
  type ProjectAnalysisSummary,
  summariseProjectAnalyses,
} from "~/utils/summarise-project-analyses";

export function useProjectAnalysisSummary() {
  const summaries = ref<Map<string, ProjectAnalysisSummary>>(new Map());
  const dataStoreProjectIds = ref<Set<string>>(new Set());
  const loading = ref(false);
  const truncated = ref(false);
  const incomplete = ref(false);

  // Kong could not be reached, so dataStoreProjectIds is not reliable
  const dataStoreUnavailable = ref(false);

  async function refreshSummaries() {
    loading.value = true;
    try {
      const hubApi = useNuxtApp().$hubApi as unknown as HubFetch;
      const [analysisNodeResult, dataStoreResult, executionStatuses] =
        await Promise.all([
          fetchAllAnalysisNodes(hubApi),
          fetchDataStoreProjectIds(hubApi),
          fetchExecutionStatuses(hubApi),
        ]);

      dataStoreProjectIds.value = dataStoreResult.projectIds;
      dataStoreUnavailable.value = dataStoreResult.unavailable;
      truncated.value = analysisNodeResult.truncated;
      incomplete.value = analysisNodeResult.incomplete;
      summaries.value = summariseProjectAnalyses(
        mergeExecutionStatuses(analysisNodeResult.nodes, executionStatuses),
        dataStoreResult.projectIds,
      );
    } finally {
      loading.value = false;
    }
  }

  // Handle projects with no analyses or missing proj ID
  function summaryFor(
    projectId: string | undefined | null,
  ): ProjectAnalysisSummary {
    if (!projectId) return emptyProjectAnalysisSummary(false);
    return (
      summaries.value.get(projectId) ??
      emptyProjectAnalysisSummary(dataStoreProjectIds.value.has(projectId))
    );
  }

  return {
    summaries,
    dataStoreProjectIds,
    loading,
    truncated,
    incomplete,
    dataStoreUnavailable,
    refreshSummaries,
    summaryFor,
  };
}
