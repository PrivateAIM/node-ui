import { computed, onMounted, onUnmounted, ref } from "vue";
import { useNuxtApp, useState } from "nuxt/app";
import { useToast } from "primevue/usetoast";
import { getAnalysisNodes } from "~/composables/useAPIFetch";
import type {
  AnalysisNode,
  AnalysisStatus,
  ListRoutes,
  PodProgressResponse,
  Project,
  Route,
} from "~/services/Api";
import type { ModifiedAnalysisNode } from "~/services/modifiedApiInterfaces";
import { parseAnalysis, setProgress } from "~/utils/analysis-row";
import {
  showCacheWarningToast,
  showConnectionErrorToast,
} from "~/utils/connection-error-toast";
import { formatDataRow } from "~/utils/format-data-row";
import { parseKongTags } from "~/utils/parse-kong-tags";

const QUERY_LIMIT = 50;
const POLL_INTERVAL_MS = 15000;

/** Loads, caches, paginates and polls the analysis nodes table; must be awaited in setup. */
export async function useAnalyses() {
  const toast = useToast();
  const tableLoading = ref(true);

  const analysesMap = ref<Map<string, ModifiedAnalysisNode>>(new Map());
  const analyses = computed(() => Array.from(analysesMap.value.values()));
  const projMap = new Map<string, string>();
  const kongRoutes = ref<Set<string>>(new Set());

  const analysisCache = useState<AnalysisNode[] | undefined>(
    "analysisCache",
    () => undefined,
  );
  const projectCache = useState<Project[] | undefined>(
    "projectCache",
    () => undefined,
  );
  const podOrcUnreacheable = ref(false);

  let allResultsRetrieved = false;
  let currentOffset = QUERY_LIMIT; // Start with query limit and will increment by same amount

  let tableRefreshIntervalId: ReturnType<typeof setInterval> | undefined;
  let isPolling = false;

  // Lifecycle hooks must be registered before the first await
  onMounted(() => {
    compileAnalysisTable(status.value, analysisNodeResp.value);
    tableRefreshIntervalId = setInterval(pollTableData, POLL_INTERVAL_MS);
  });

  onUnmounted(() => {
    if (tableRefreshIntervalId) clearInterval(tableRefreshIntervalId);
  });

  const { data: analysisNodeResp, status, refresh } = await getAnalysisNodes(); // Get the first batch of 50

  async function getProjects() {
    return (await useNuxtApp()
      .$hubApi("/projects", {
        method: "GET",
        query: {
          sort: "-updatedAt",
          fields: "id,name,displayName",
        },
      })
      .catch(() => undefined)) as Project[];
  }

  async function getKongRoutes() {
    const kongRoutesResp = (await useNuxtApp()
      .$hubApi("/kong/project", {
        method: "GET",
      })
      .catch(() => undefined)) as ListRoutes;
    if (kongRoutesResp && kongRoutesResp.data) {
      const projIds: string[] = [];
      kongRoutesResp.data.forEach((route: Route) => {
        const projUuid = parseKongTags(route.tags).project;
        if (projUuid) {
          projIds.push(projUuid);
        }
      });
      kongRoutes.value = new Set(projIds);
    }
  }

  // Iterate through projects and populate map with proj UUID: name
  async function parseProjects() {
    const projResp = await getProjects();
    let projData: Project[] | undefined;
    if (projResp) {
      projectCache.value = projResp;
      projData = projResp;
    } else {
      // No need to show cache warning here since it is already called during analysis parsing
      projData = projectCache.value;
    }
    if (projData) {
      projData.forEach((proj: Project) => {
        if (proj.id) {
          projMap.set(proj.id, proj.displayName ?? proj.name ?? proj.id);
        }
      });
    }
  }

  async function getExecutionStatusesFromPodOrc(): Promise<
    PodProgressResponse | undefined
  > {
    const podOrcResponse = (await useNuxtApp()
      .$hubApi("/po/status", {
        method: "GET",
      })
      .catch(() => {
        if (!podOrcUnreacheable.value) {
          podOrcUnreacheable.value = true;
          showConnectionErrorToast(toast, {
            severity: "warn",
            summary: "Missing PO Status Update",
            detail:
              "Unable to retrieve pod statuses from the PO, relying on information from the Hub",
            life: 3000,
          });
        }
        return undefined;
      })) as PodProgressResponse;
    podOrcUnreacheable.value = !podOrcResponse;
    return podOrcResponse;
  }

  async function compileAnalysisTable(
    respStatus: string,
    respData: AnalysisNode[] | undefined,
    silent = false,
    merge = false,
  ) {
    if (!silent) tableLoading.value = true;
    await parseProjects();
    await getKongRoutes();
    const parsedAnalyses = new Map<string, ModifiedAnalysisNode>();
    const currentExecutionStatuses: PodProgressResponse | undefined =
      await getExecutionStatusesFromPodOrc();

    let analysisData: AnalysisNode[] | undefined;
    if (respStatus === "success") {
      if (!merge) {
        analysisCache.value = respData;
      }
      analysisData = respData;
    } else {
      showCacheWarningToast(toast);
      analysisData = analysisCache.value;
    }

    const formattedAnalyses = formatDataRow(
      analysisData,
      ["createdAt", "updatedAt"],
      [],
    ) as ModifiedAnalysisNode[];
    if (formattedAnalyses && projMap.size > 0) {
      formattedAnalyses.forEach((analysisEntry: ModifiedAnalysisNode) => {
        parsedAnalyses.set(
          analysisEntry.analysisId,
          parseAnalysis(
            analysisEntry,
            currentExecutionStatuses,
            projMap,
            kongRoutes.value,
          ),
        );
      });
      if (merge) {
        parsedAnalyses.forEach((value, key) =>
          analysesMap.value.set(key, value),
        );
      } else {
        analysesMap.value = parsedAnalyses;
      }
    }
    tableLoading.value = false;
  }

  async function pollTableData() {
    if (isPolling) return;
    isPolling = true;
    try {
      await refresh();
      await compileAnalysisTable(status.value, analysisNodeResp.value, true);
    } finally {
      isPolling = false;
    }
  }

  async function refreshTable() {
    await refresh();
    await compileAnalysisTable(status.value, analysisNodeResp.value);
  }

  async function getNextPage() {
    const nextSetResults = (await useNuxtApp()
      .$hubApi("/analysis-nodes", {
        method: "GET",
        query: {
          page: {
            offset: currentOffset,
            limit: QUERY_LIMIT,
          },
          include: "analysis",
          sort: "-updatedAt",
        },
      })
      .catch(() => undefined)) as AnalysisNode[] | undefined;
    if (nextSetResults && nextSetResults.length > 0) {
      if (nextSetResults.length < QUERY_LIMIT) {
        // Fewer than limit means we are at the end
        allResultsRetrieved = true;
      }
      currentOffset += QUERY_LIMIT;
      await compileAnalysisTable("success", nextSetResults, true, true);
    } else {
      // No results returned means all were retrieved
      allResultsRetrieved = true;
    }
  }

  function onPage(event: { page: number; rows: number }) {
    const currentPage = event.page + 1;
    const currentMaxPage = Math.ceil(analysesMap.value.size / event.rows);

    // Fetch the next batch once the page before the last loaded one is reached
    if (!allResultsRetrieved && currentPage >= currentMaxPage - 1) {
      getNextPage();
    }
  }

  function updateAnalysisRun(
    analysisId: string,
    newStatusData: AnalysisStatus | undefined,
  ) {
    if (analysesMap.value.has(analysisId)) {
      const analysisToUpdate = analysesMap.value.get(analysisId)!;
      if (newStatusData) {
        analysisToUpdate.executionStatus = newStatusData.status;
        analysisToUpdate.executionProgress = newStatusData.progress || 0;
      }
      analysesMap.value.set(analysisId, setProgress(analysisToUpdate));
    }
  }

  return {
    analyses,
    tableLoading,
    status,
    refreshTable,
    onPage,
    updateAnalysisRun,
  };
}
