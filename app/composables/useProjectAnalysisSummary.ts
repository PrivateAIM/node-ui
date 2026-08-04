import { ref } from "vue";
import { useNuxtApp } from "nuxt/app";
import {
  type AnalysisNode,
  type ListRoutes,
  type PodProgressResponse,
  PodStatus,
  type Route,
} from "~/services/Api";
import { parseKongTags } from "~/utils/parse-kong-tags";
import {
  emptyProjectAnalysisSummary,
  type ProjectAnalysisSummary,
  summariseProjectAnalyses,
} from "~/utils/summarise-project-analyses";

export type HubFetch = (
  url: string,
  opts?: Record<string, unknown>,
) => Promise<unknown>;

const PAGE_LIMIT = 50;
const MAX_PAGES = 40;

const FINISHED_STATUSES: Array<PodStatus | null | undefined> = [
  PodStatus.Failed,
  PodStatus.Executed,
];

export async function fetchAllAnalysisNodes(
  hubApi: HubFetch,
): Promise<AnalysisNode[]> {
  const allNodes: AnalysisNode[] = [];

  for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex++) {
    const nextPage = (await hubApi("/analysis-nodes", {
      method: "GET",
      query: {
        include: "analysis",
        sort: "-updated_at",
        page: { offset: pageIndex * PAGE_LIMIT, limit: PAGE_LIMIT },
      },
    }).catch(() => undefined)) as AnalysisNode[] | undefined;

    if (!nextPage || nextPage.length === 0) break;
    allNodes.push(...nextPage);
    if (nextPage.length < PAGE_LIMIT) break;
  }

  return allNodes;
}

export async function fetchDataStoreProjectIds(
  hubApi: HubFetch,
): Promise<Set<string>> {
  const routesResp = (await hubApi("/kong/project", { method: "GET" }).catch(
    () => undefined,
  )) as ListRoutes | undefined;

  const projectIds = new Set<string>();
  routesResp?.data?.forEach((route: Route) => {
    const projectId = parseKongTags(route.tags).project;
    if (projectId) projectIds.add(projectId);
  });
  return projectIds;
}

export async function fetchExecutionStatuses(
  hubApi: HubFetch,
): Promise<PodProgressResponse | undefined> {
  return (await hubApi("/po/status", { method: "GET" }).catch(
    () => undefined,
  )) as PodProgressResponse | undefined;
}

export function mergeExecutionStatuses(
  analysisNodes: AnalysisNode[],
  executionStatuses: PodProgressResponse | undefined,
): AnalysisNode[] {
  return analysisNodes.map((analysisNode) => {
    const merged = { ...analysisNode };
    const analysisId = merged.analysis_id;

    if (executionStatuses && analysisId in executionStatuses) {
      merged.execution_status = executionStatuses[analysisId]!
        .status as AnalysisNode["execution_status"];
    } else if (
      !FINISHED_STATUSES.includes(merged.execution_status as PodStatus)
    ) {
      merged.execution_status = null;
    }

    return merged;
  });
}

export function useProjectAnalysisSummary() {
  const summaries = ref<Map<string, ProjectAnalysisSummary>>(new Map());
  const dataStoreProjectIds = ref<Set<string>>(new Set());
  const loading = ref(false);

  async function refreshSummaries() {
    loading.value = true;
    try {
      const hubApi = useNuxtApp().$hubApi as unknown as HubFetch;
      const [analysisNodes, projectIdsWithDataStore, executionStatuses] =
        await Promise.all([
          fetchAllAnalysisNodes(hubApi),
          fetchDataStoreProjectIds(hubApi),
          fetchExecutionStatuses(hubApi),
        ]);

      dataStoreProjectIds.value = projectIdsWithDataStore;
      summaries.value = summariseProjectAnalyses(
        mergeExecutionStatuses(analysisNodes, executionStatuses),
        projectIdsWithDataStore,
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
    refreshSummaries,
    summaryFor,
  };
}
