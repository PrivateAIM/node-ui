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
  PodStatus.Stopped,
];

export interface AnalysisNodeFetchResult {
  nodes: AnalysisNode[];
  truncated: boolean;
  incomplete: boolean;
}

export async function fetchAllAnalysisNodes(
  hubApi: HubFetch,
): Promise<AnalysisNodeFetchResult> {
  const allNodes: AnalysisNode[] = [];
  let truncated = false;
  let incomplete = false;

  for (let pageIndex = 0; pageIndex < MAX_PAGES; pageIndex++) {
    let nextPage: AnalysisNode[] | undefined;
    try {
      nextPage = (await hubApi("/analysis-nodes", {
        method: "GET",
        query: {
          include: "analysis",
          sort: "-updatedAt",
          page: { offset: pageIndex * PAGE_LIMIT, limit: PAGE_LIMIT },
        },
      })) as AnalysisNode[];
    } catch {
      // To avoid it thinking it's the end of the result set
      incomplete = true;
      break;
    }

    if (!nextPage || nextPage.length === 0) break;
    allNodes.push(...nextPage);
    if (nextPage.length < PAGE_LIMIT) break;
    // Full set = yet more results to fetch
    if (pageIndex === MAX_PAGES - 1) truncated = true;
  }

  return { nodes: allNodes, truncated, incomplete };
}

export interface DataStoreProjectIdsResult {
  projectIds: Set<string>;
  unavailable: boolean;
}

export async function fetchDataStoreProjectIds(
  hubApi: HubFetch,
): Promise<DataStoreProjectIdsResult> {
  let unavailable = false;
  const routesResp = (await hubApi("/kong/project", { method: "GET" }).catch(
    () => {
      unavailable = true;
      return undefined;
    },
  )) as ListRoutes | undefined;

  const projectIds = new Set<string>();
  routesResp?.data?.forEach((route: Route) => {
    const projectId = parseKongTags(route.tags).project;
    if (projectId) projectIds.add(projectId);
  });
  return { projectIds, unavailable };
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
  const orchestratorReachable = executionStatuses !== undefined;

  return analysisNodes.map((analysisNode) => {
    const merged = { ...analysisNode };
    const analysisId = merged.analysis_id;

    if (executionStatuses && analysisId in executionStatuses) {
      merged.execution_status = executionStatuses[analysisId]!
        .status as AnalysisNode["execution_status"];
    } else if (
      orchestratorReachable &&
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
