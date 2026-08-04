<script lang="ts" setup>
import { useNuxtApp, useState } from "nuxt/app";
import { useToast } from "primevue/usetoast";
import ProgressBar from "primevue/progressbar";
import { getAnalysisNodes } from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
import {
  showCacheWarningToast,
  showConnectionErrorToast,
} from "~/composables/connectionErrorToast";
import { FilterMatchMode, FilterService } from "@primevue/core/api";
import SearchBar from "~/components/table/SearchBar.vue";
import AnalysisControlButtons from "./AnalysisControlButtons.vue";
import {
  getApprovalStatusSeverity,
  getBuildStatusSeverity,
  getExecutionStatusSeverity,
} from "~/utils/status-tag-severity";
import {
  type AnalysisNode,
  type AnalysisStatus,
  type ListRoutes,
  type PodProgressResponse,
  PodStatus,
  type Project,
  type Route,
} from "~/services/Api";
import { ApprovalStatus } from "~/types/node";
import { parseKongTags } from "~/utils/parse-kong-tags";
import ContainerCounter from "~/components/analysis/ContainerCounter.vue";
import DataStoreBadge from "~/components/shared/DataStoreBadge.vue";
import { useDatastoreRequirement } from "~/composables/useDatastoreRequirement";
import type {
  HubStatuses,
  ModifiedAnalysisNode,
} from "~/services/modifiedApiInterfaces";
import { ProcessStatus } from "~/types/analysis";

const toast = useToast();
const tableLoading = ref(true);

// Data Store Requirement Check
const { nodeType, requireDataStore: datastoreRequired } =
  useDatastoreRequirement();

const analysesMap = ref<Map<string, ModifiedAnalysisNode>>(new Map());
const analyses = computed(() => Array.from(analysesMap.value.values()));
const projMap = new Map<string, string>();

const expandRowEntries = [];
const expandedRows = ref();

// Filter settings
const filters = ref();

// Cache
const analysisCache = useState<AnalysisNode[] | undefined>(
  "analysisCache",
  () => undefined,
);
const projectCache = useState<Project[] | undefined>(
  "projectCache",
  () => undefined,
);
const podOrcUnreacheable = ref(false);

// Paginated table
let allResultsRetrieved = false;
const queryLimit = 50;
let currentOffset = 50; // Start with query limit and will increment by same amount

const kongRoutes = ref<Set<string>>(new Set());

// Imported values
const approvalStatuses = Object.values(ApprovalStatus);
const processStatuses = Object.values(ProcessStatus);
const podStatuses = Object.values(PodStatus);

// Combined "Hub Statuses" column filtering
const HUB_STATUS_FILTER_MATCH_MODE = "hubStatusMatch";
type HubStatusGroup =
  | "approval_status"
  | "build_status"
  | "distribution_status";

function getHubStatusSeverity(group: HubStatusGroup, status: string) {
  return group === "approval_status"
    ? getApprovalStatusSeverity(status as ApprovalStatus)
    : getBuildStatusSeverity(status as ProcessStatus);
}

const hubStatusFilterOptions = [
  {
    label: "Approval Status",
    items: approvalStatuses.map((status) => ({
      label: status,
      value: `approval_status::${status}`,
      group: "approval_status" as HubStatusGroup,
      status,
    })),
  },
  {
    label: "Build Status",
    items: processStatuses.map((status) => ({
      label: status,
      value: `build_status::${status}`,
      group: "build_status" as HubStatusGroup,
      status,
    })),
  },
  {
    label: "Distribution Status",
    items: processStatuses.map((status) => ({
      label: status,
      value: `distribution_status::${status}`,
      group: "distribution_status" as HubStatusGroup,
      status,
    })),
  },
];

// Match a row when any of the selected statuses matches its respective column
FilterService.register(
  HUB_STATUS_FILTER_MATCH_MODE,
  (value: HubStatuses | undefined, filter: string[] | undefined | null) => {
    if (!filter || filter.length === 0) return true;
    if (!value) return false;
    return filter.some((selected) => {
      const [group, status] = selected.split("::");
      return value[group as HubStatusGroup] === status;
    });
  },
);

const { data: analysisNodeResp, status, refresh } = await getAnalysisNodes(); // Get the first batch of 50

async function getProjects() {
  return (await useNuxtApp()
    .$hubApi("/projects", {
      method: "GET",
      query: {
        sort: "-updated_at",
        fields: "id,name,display_name",
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
        projMap.set(proj.id, proj.display_name ?? proj.name ?? proj.id);
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

function setProgress(analysis: ModifiedAnalysisNode): ModifiedAnalysisNode {
  // For testing: Math.round(Math.random() * 100);
  analysis.execution_progress = analysis.execution_progress
    ? analysis.execution_progress
    : 0;

  const currentRunStatus = analysis.execution_status;
  if (currentRunStatus) {
    if (currentRunStatus === PodStatus.Failed) {
      analysis.execution_progress = 0;
    } else if (currentRunStatus === PodStatus.Executed) {
      analysis.execution_progress = 100;
    }
  }
  return analysis;
}

function determineProgressBarColor(progress: number) {
  let color: string;

  if (!progress) {
    color = "#FFFFFF";
  } else if (progress < 33) {
    color = "#ef4444";
  } else if (progress < 66) {
    color = "#f59e0b";
  } else {
    color = "#10b981";
  }

  return {
    "--p-progressbar-value-background": color,
  };
}

function parseAnalysis(
  analysisEntry: ModifiedAnalysisNode,
  executionStatuses: PodProgressResponse | undefined,
): ModifiedAnalysisNode {
  const projId = analysisEntry.analysis?.project_id;
  const analysisId = analysisEntry.analysis_id;
  analysisEntry.analysis_name =
    analysisEntry.analysis?.display_name ??
    analysisEntry.analysis?.name ??
    analysisId;
  if (projId) {
    analysisEntry.project_name = projMap.has(projId) ? projMap.get(projId) : "";
    analysisEntry.datastore = kongRoutes.value.has(projId);
  }
  const acceptableHubStatuses: Array<PodStatus | null | undefined> = [
    PodStatus.Failed,
    PodStatus.Executed,
  ];
  if (executionStatuses && analysisId in executionStatuses) {
    const podStatus = executionStatuses[analysisId]!;
    analysisEntry.execution_status = podStatus.status;
    analysisEntry.execution_progress =
      podStatus.progress ?? analysisEntry.execution_progress;
  } else {
    if (!acceptableHubStatuses.includes(analysisEntry.execution_status)) {
      analysisEntry.execution_status = null;
    }
  }
  analysisEntry.hub_statuses = {
    approval_status: analysisEntry.approval_status,
    build_status: analysisEntry.analysis?.build_status ?? null,
    distribution_status: analysisEntry.analysis?.distribution_status ?? null,
  };
  return setProgress(analysisEntry);
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
    ["created_at", "updated_at"],
    expandRowEntries,
  ) as ModifiedAnalysisNode[];
  if (formattedAnalyses && projMap.size > 0) {
    formattedAnalyses.forEach((analysisEntry: ModifiedAnalysisNode) => {
      parsedAnalyses.set(
        analysisEntry.analysis_id,
        parseAnalysis(analysisEntry, currentExecutionStatuses),
      );
    });
    if (merge) {
      parsedAnalyses.forEach((value, key) => analysesMap.value.set(key, value));
    } else {
      analysesMap.value = parsedAnalyses;
    }
  }
  tableLoading.value = false;
}

let tableRefreshIntervalId: ReturnType<typeof setInterval> | undefined;
let isPolling = false;

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

onMounted(() => {
  compileAnalysisTable(status.value, analysisNodeResp.value);
  tableRefreshIntervalId = setInterval(pollTableData, 15000);
});

onUnmounted(() => {
  if (tableRefreshIntervalId) clearInterval(tableRefreshIntervalId);
});

async function onTableRefresh() {
  await refresh();
  await compileAnalysisTable(status.value, analysisNodeResp.value);
}

function onPage(event) {
  const currentPage = event.page + 1;
  const currentNumberEntries = analysesMap.value.size;
  const currentMaxPage = Math.ceil(currentNumberEntries / event.rows);

  if (!allResultsRetrieved) {
    // If not all results retrieved
    if (currentPage >= currentMaxPage - 1) {
      // If page before last is clicked
      getNextPage();
    }
  }
}

async function getNextPage() {
  const nextSetResults = (await useNuxtApp()
    .$hubApi("/analysis-nodes", {
      method: "GET",
      query: {
        page: {
          offset: currentOffset,
          limit: queryLimit,
        },
        include: "analysis,node",
        sort: "-updated_at",
      },
    })
    .catch(() => undefined)) as AnalysisNode[] | undefined;
  if (nextSetResults && nextSetResults.length > 0) {
    if (nextSetResults.length < queryLimit) {
      // Fewer than limit means we are at the end
      allResultsRetrieved = true;
    }
    currentOffset += queryLimit; // Increment offset value
    await compileAnalysisTable("success", nextSetResults, true, true);
  } else {
    // No results returned means all were retrieved
    allResultsRetrieved = true;
  }
}

// Table filters
const defaultFilters = {
  global: { value: undefined, matchMode: FilterMatchMode.CONTAINS },
  hub_statuses: { value: undefined, matchMode: HUB_STATUS_FILTER_MATCH_MODE },
  execution_status: { value: undefined, matchMode: FilterMatchMode.IN },
};
filters.value = defaultFilters;

function resetFilters() {
  const clearedFilters = {};
  for (const filterKey in defaultFilters) {
    clearedFilters[filterKey] = {
      ...defaultFilters[filterKey],
    };
    clearedFilters[filterKey].value = undefined;
  }
  filters.value = clearedFilters;
}

const updateFilters = (filterText: string) => {
  filters.value.global.value = filterText;
};

function updateAnalysisRun(
  analysisId: string,
  newStatusData: AnalysisStatus | undefined,
) {
  if (analysesMap.value.has(analysisId)) {
    const analysisToUpdate = analysesMap.value.get(analysisId)!; // Tell typescript we are sure there is a value
    if (newStatusData) {
      analysisToUpdate.execution_status = newStatusData.status;
      analysisToUpdate.execution_progress = newStatusData.progress || 0;
    }
    analysesMap.value.set(analysisId, setProgress(analysisToUpdate));
  }
}

function updateExecutionStatusFilter(filterText: string) {
  const currentExecutionStatusFilters = filters.value.execution_status.value;
  if (!currentExecutionStatusFilters) {
    // If value is null then initialize with filter in array
    filters.value.execution_status.value = [filterText];
  } else {
    // Already run status filters present
    if (currentExecutionStatusFilters.includes(filterText)) {
      // If filter already there, then remove it
      const filteredStatuses = currentExecutionStatusFilters.filter(
        (item) => item !== filterText,
      );
      if (filteredStatuses.length == 0) {
        // If empty array after filtering then set to null
        filters.value.execution_status.value = undefined;
      } else {
        filters.value.execution_status.value = filteredStatuses;
      }
    } else {
      // Apply filter since it isn't present
      filters.value.execution_status.value.push(filterText);
    }
  }
}

// Missing data store for row toast
const showDataStoreNavToast = () => {
  toast.add({
    severity: "error",
    summary:
      "Unable to find an associated data store, click the button below " +
      "to create a data store for the project of this analysis",
    group: "datastoreToastLink",
    life: 10000,
  });
};

const onNavigate = () => {
  toast.removeGroup("datastoreToastLink");
  navigateTo("/data-stores/create");
};

// Navigate to data store creation with the analysis' project preselected
const onCreateDataStore = (projectId: string | null | undefined) => {
  navigateTo({
    path: "/data-stores/create",
    query: projectId ? { projectId } : undefined,
  });
};

const onCloseNavToast = () => {
  toast.removeGroup("datastoreToastLink");
};
</script>

<template>
  <div class="card flex justify-content-center">
    <Toast
      group="datastoreToastLink"
      position="top-right"
      @close="onCloseNavToast()"
    >
      <template #message="slotProps">
        <div class="flex flex-col items-start flex-auto">
          <div class="flex items-center gap-2">
            <span class="font-bold text-900">Missing Data Store!</span>
          </div>
          <div class="font-medium my-4">
            <span>{{ slotProps.message.summary }}</span>
          </div>
          <Button
            class="p-button-sm nav-btn"
            label="Create a Data Store"
            severity="info"
            @click="onNavigate"
          >
            Create Data Store
          </Button>
        </div>
      </template>
    </Toast>
  </div>
  <div class="card analysis-card">
    <Card class="content-card">
      <template #title>Analyses</template>
      <template #content>
        <div class="analysis-description-box">
          <div class="analysis-description">
            <span
              >This table provides an overview of the analyses that are
              registered to run on this node. Approved users can <b>start</b>,
              <b>stop</b>, or <b>delete</b> analyses, as well as view the logs
              for both the analysis and associated nginx containers.
            </span>
          </div>
          <div class="analysis-container-counter">
            <ContainerCounter
              :activeFilters="filters"
              :analyses="analyses"
              @applyExecutionStatusFilter="updateExecutionStatusFilter"
            />
          </div>
        </div>
        <div class="table-header-row">
          <SearchBar
            :searchTerm="defaultFilters.global.value"
            @clearFilters="resetFilters"
            @updateSearch="updateFilters"
          />
          <div class="card flex justify-content-center refresh-switch">
            <Button
              v-tooltip.top="'Refresh table'"
              :loading="status === 'pending'"
              aria-label="Filter"
              class="table-refresh-btn"
              icon="pi pi-refresh"
              severity="contrast"
              @click="onTableRefresh"
            />
          </div>
        </div>
        <DataTable
          v-model:expandedRows="expandedRows"
          v-model:filters="filters"
          :globalFilterFields="['analysis_name', 'project_name', 'node.name']"
          :loading="tableLoading"
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          :sortOrder="-1"
          :value="analyses"
          class="rounded-table analysis-table structured-table"
          dataKey="id"
          filterDisplay="menu"
          paginator
          sortField="updated_at.timestamp"
          stripedRows
          tableStyle="min-width: 50rem"
          @page="onPage"
        >
          <template #empty> No analyses found.</template>
          <Column v-if="expandRowEntries.length" expander style="width: 5rem" />
          <Column :sortable="true" field="analysis_name">
            <template #header>
              <span v-tooltip.top="'Name of the analysis'" class="help-text">
                <b>Name</b>
              </span>
            </template>
            <template #body="{ data }">
              <span v-tooltip.right="data.analysis_id" class="help-text">
                {{ data.analysis_name }}
              </span>
            </template>
          </Column>
          <Column
            :showAddButton="false"
            :showApplyButton="false"
            :showClearButton="false"
            :showFilterMatchModes="false"
            :showFilterOperator="false"
            field="hub_statuses"
            filterField="hub_statuses"
          >
            <template #header>
              <span
                v-tooltip.top="
                  'Approval, build and distribution statuses from the Hub'
                "
                class="help-text"
              >
                <b>Hub Statuses</b>
              </span>
            </template>
            <template #body="{ data }">
              <div class="hub-statuses">
                <div class="hub-status-line">
                  <span class="hub-status-label">Approval Status</span>
                  <Tag
                    v-if="data.approval_status"
                    :severity="getApprovalStatusSeverity(data.approval_status)"
                    :value="data.approval_status"
                  />
                  <span v-else class="hub-status-empty">—</span>
                </div>
                <div class="hub-status-line">
                  <span class="hub-status-label">Build Status</span>
                  <Tag
                    v-if="data.analysis.build_status"
                    :severity="
                      getBuildStatusSeverity(data.analysis.build_status)
                    "
                    :value="data.analysis.build_status"
                  />
                  <span v-else class="hub-status-empty">—</span>
                </div>
                <div class="hub-status-line">
                  <span class="hub-status-label">Distribution Status</span>
                  <Tag
                    v-if="data.analysis.distribution_status"
                    :severity="
                      getBuildStatusSeverity(data.analysis.distribution_status)
                    "
                    :value="data.analysis.distribution_status"
                  />
                  <span v-else class="hub-status-empty">—</span>
                </div>
              </div>
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                v-model="filterModel.value"
                :options="hubStatusFilterOptions"
                class="p-column-filter hub-status-filter"
                optionGroupChildren="items"
                optionGroupLabel="label"
                optionLabel="label"
                optionValue="value"
                placeholder="Any status"
                @change="filterCallback()"
              >
                <template #optiongroup="slotProps">
                  <span class="hub-status-filter-group">
                    {{ slotProps.option.label }}
                  </span>
                </template>
                <template #option="slotProps">
                  <Tag
                    :severity="
                      getHubStatusSeverity(
                        slotProps.option.group,
                        slotProps.option.status,
                      )
                    "
                    :value="slotProps.option.status"
                  />
                </template>
              </MultiSelect>
            </template>
          </Column>
          <Column
            :showAddButton="false"
            :showApplyButton="false"
            :showClearButton="false"
            :showFilterMatchModes="false"
            :showFilterOperator="false"
            field="execution_status"
            filterField="execution_status"
          >
            <template #header>
              <span
                v-tooltip.top="'Current run status of the analysis container'"
                class="help-text"
              >
                <b>Run Status</b>
              </span>
            </template>
            <template #body="{ data }">
              <Tag
                v-if="data.execution_status"
                :severity="getExecutionStatusSeverity(data.execution_status)"
                :value="data.execution_status"
              />
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                v-model="filterModel.value"
                :options="podStatuses"
                class="p-column-filter"
                optionLabel=""
                placeholder="Any"
                @change="filterCallback()"
              >
                <template #option="slotProps">
                  <div class="flex align-items-center gap-2">
                    <Tag
                      v-if="slotProps.option"
                      :severity="getExecutionStatusSeverity(slotProps.option)"
                      :value="slotProps.option"
                    />
                  </div>
                </template>
              </MultiSelect>
            </template>
          </Column>
          <Column :sortable="true" field="project_name">
            <template #header>
              <span
                v-tooltip.top="'Name of the associated project'"
                class="help-text"
              >
                <b>Project</b>
              </span>
            </template>
            <template #body="{ data }">
              <span v-tooltip.top="data.analysis.project_id" class="help-text">
                {{ data.project_name }}
              </span>
            </template>
          </Column>
          <Column
            :hidden="nodeType === 'aggregator'"
            :sortable="true"
            field="datastore"
          >
            <template #header>
              <span
                v-tooltip.top="'Whether the analysis has access to data'"
                class="help-text"
              >
                <b>Data Store</b>
              </span>
            </template>
            <template #body="{ data }">
              <DataStoreBadge
                :hasDataStore="data.datastore"
                :projectId="data.analysis.project_id"
                :required="datastoreRequired!"
                @createDataStore="onCreateDataStore"
              />
            </template>
          </Column>
          <Column :sortable="true" dataType="date" field="created_at.timestamp">
            <template #header>
              <span
                v-tooltip.top="'Date the analysis image was created'"
                class="help-text"
              >
                <b>Created On</b>
              </span>
            </template>
            <template #body="{ data }">
              <p v-tooltip.top="data.created_at.long">
                {{ data.created_at.short }}
              </p>
            </template>
          </Column>
          <Column :sortable="true" dataType="date" field="updated_at.timestamp">
            <template #header>
              <span
                v-tooltip.top="
                  'Date the analysis container on the node was last modified'
                "
                class="help-text"
              >
                <b>Last Updated</b>
              </span>
            </template>
            <template #body="{ data }">
              <p v-tooltip.top="data.updated_at.long">
                {{ data.updated_at.short }}
              </p>
            </template>
          </Column>
          <Column field="progress">
            <template #header>
              <span
                v-tooltip.top="'Self-reported progress of analysis'"
                class="help-text"
              >
                <b>Progress</b>
              </span>
            </template>
            <template #body="{ data }">
              <ProgressBar
                :mode="
                  data.execution_status === PodStatus.Executing &&
                  !data.execution_progress
                    ? 'indeterminate'
                    : 'determinate'
                "
                :style="
                  data.execution_status === PodStatus.Executing &&
                  !data.execution_progress
                    ? {}
                    : determineProgressBarColor(data.execution_progress)
                "
                :value="data.execution_progress"
              />
            </template>
          </Column>
          <Column :exportable="false" field="expand.id">
            <template #header>
              <span
                v-tooltip.top="'Controls for the analysis container'"
                class="help-text"
              >
                <b>Analysis Controls</b>
              </span>
            </template>
            <template #body="slotProps">
              <div class="control-buttons">
                <AnalysisControlButtons
                  :analysisBuildStatus="slotProps.data.analysis.build_status"
                  :analysisDistributionStatus="
                    slotProps.data.analysis.distribution_status
                  "
                  :analysisExecutionStatus="slotProps.data.execution_status"
                  :analysisId="slotProps.data.analysis_id"
                  :analysisNodeId="slotProps.data.id"
                  :approvalStatus="slotProps.data.approval_status"
                  :datastore="slotProps.data.datastore"
                  :nodeId="slotProps.data.node_id"
                  :projectId="slotProps.data.analysis.project_id"
                  :requireDatastore="datastoreRequired!"
                  @missingDataStore="showDataStoreNavToast"
                  @updateAnalysisRow="updateAnalysisRun"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<style>
.nav-btn {
  margin-top: 0.625rem;
}

/* structured-table centers non-first cells via justify-items, which shrinks
   the block-level progress bar to its content width. Force it to fill the cell. */
.analysis-table .p-progressbar {
  width: 100%;
}

.hub-statuses {
  display: inline-grid;
  grid-template-columns: auto auto;
  align-items: center;
  gap: 0.2rem 0.4rem;
  text-align: left;
}

.hub-status-line {
  display: contents;
}

.hub-status-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
  white-space: nowrap;
}

.hub-status-empty {
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
}

.hub-statuses .p-tag {
  font-size: 0.65rem;
  padding: 0.15rem 0.3rem;
  line-height: 1.1;
}

.hub-status-filter-group {
  font-weight: 700;
  font-size: 0.8rem;
}

.analysis-description-box {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  gap: 1rem;
  margin-bottom: 2rem;
}

.analysis-description {
  flex: 2 1 300px;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.analysis-description ul {
  list-style: disc;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.analysis-container-counter {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
}
</style>
