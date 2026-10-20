import {
  type AnalysisNode,
  type ListRoutes,
  type PodProgressResponse,
  PodStatus,
  type Route,
} from "~/services/Api";
import { parseKongTags } from "~/utils/parse-kong-tags";

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

interface AnalysisNodeFetchResult {
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

interface DataStoreProjectIdsResult {
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
