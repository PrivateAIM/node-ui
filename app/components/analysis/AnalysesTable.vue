<script lang="ts" setup>
import { useNuxtApp, useState } from "nuxt/app";
import Badge from "primevue/badge";
import { useToast } from "primevue/usetoast";
import ProgressBar from "primevue/progressbar";
import { getAnalysisNodes } from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
import {
  showCacheWarningToast,
  showConnectionErrorToast,
} from "~/composables/connectionErrorToast";
import { FilterMatchMode } from "@primevue/core/api";
import SearchBar from "~/components/table/SearchBar.vue";
import AnalysisControlButtons from "./AnalysisControlButtons.vue";
import {
  getApprovalStatusSeverity,
  getBuildStatusSeverity,
  getRunStatusSeverity,
} from "~/utils/status-tag-severity";
import {
  type AnalysisNode,
  type ListRoutes,
  PodStatus,
  type Project,
  type Route,
  type StatusResponse,
} from "~/services/Api";
import { AnalysisBuildStatus, AnalysisNodeRunStatus } from "~/types/analysis";
import { ApprovalStatus } from "~/types/node";
import ContainerCounter from "~/components/analysis/ContainerCounter.vue";
import { useDatastoreRequirement } from "~/composables/useDatastoreRequirement";
import type { ModifiedAnalysisNode } from "~/services/modifiedApiInterfaces";

const toast = useToast();
const tableLoading = ref(true);

// Data Store Requirement Check
const { datastoreState } = await useDatastoreRequirement();
const datastoreRequired = computed(
  () => datastoreState.value.datastoreRequired,
);
const nodeType = computed(() => datastoreState.value.nodeType);

const datastoreBadgeSeverity = computed(() =>
  datastoreRequired.value ? "danger" : "secondary",
);
const datastoreBadgeTooltip = computed(() =>
  datastoreRequired.value
    ? "Data store missing!"
    : "Data store missing, but not required",
);

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
const runStatuses = Object.values(AnalysisNodeRunStatus);
const approvalStatuses = Object.values(ApprovalStatus);
const buildStatuses = Object.values(AnalysisBuildStatus);

const { data: analysisNodeResp, status, refresh } = await getAnalysisNodes(); // Get the first batch of 50

async function getProjects() {
  return (await useNuxtApp()
    .$hubApi("/projects", {
      method: "GET",
      query: {
        sort: "-updated_at",
        fields: "id,name",
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
    kongRoutesResp.data.forEach((proj: Route) => {
      const nameChunks = proj.name?.split("-");
      if (nameChunks && nameChunks.length > 1) {
        nameChunks.pop(); // Remove suffix, either "fhir" or "s3"
        const projUuid = nameChunks.join("-");
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
      if (proj.name) {
        projMap.set(proj.id!, proj.name);
      }
    });
  }
}

async function getRunStatusesFromPodOrc(): Promise<StatusResponse | undefined> {
  const podOrcResponse = (await useNuxtApp()
    .$hubApi("/po/status", {
      method: "GET",
    })
    .catch(() => {
      showConnectionErrorToast(toast, {
        severity: "warn",
        summary: "Missing PO Status Update",
        detail:
          "Unable to retrieve pod statuses from the PO, relying on information from the Hub",
        life: 3000,
      });
    })) as StatusResponse;
  podOrcUnreacheable.value = !podOrcResponse;
  return podOrcResponse;
}

async function checkForUpdatesFromPodOrc() {
  if (!podOrcUnreacheable.value) {
    const newStatuses = await getRunStatusesFromPodOrc();
    if (newStatuses) {
      for (const [analysisId, status] of Object.entries(newStatuses)) {
        updateAnalysisRun(analysisId, status);
      }
    }
  }
}

function setProgress(analysis: ModifiedAnalysisNode): ModifiedAnalysisNode {
  // For testing: Math.round(Math.random() * 100);
  analysis.progress = analysis.progress ? analysis.progress : 0;

  const currentRunStatus = analysis.run_status;
  if (currentRunStatus) {
    if (currentRunStatus === AnalysisNodeRunStatus.Failed) {
      analysis.progress = 0;
    } else if (currentRunStatus === AnalysisNodeRunStatus.Finished) {
      analysis.progress = 100;
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
  runStatuses: StatusResponse | undefined,
): ModifiedAnalysisNode {
  const projId = analysisEntry.analysis?.project_id;
  const analysisId = analysisEntry.analysis_id;
  if (projId) {
    analysisEntry.project_name = projMap.has(projId) ? projMap.get(projId) : "";
    analysisEntry.datastore = kongRoutes.value.has(projId);
  }
  // If PodOrc status update returns undefined -> use hub info since it's all we have
  // If status from PodOrc -> use it
  // If no run status reported by PodOrc, and it's not failed/finished -> set to null (wrong hub info)
  if (runStatuses) {
    if (analysisId in runStatuses) {
      analysisEntry.run_status = runStatuses[analysisId] ?? null;
    } else {
      if (
        analysisEntry.run_status != AnalysisNodeRunStatus.Failed &&
        analysisEntry.run_status != AnalysisNodeRunStatus.Finished
      ) {
        analysisEntry.run_status = null;
      }
    }
  }
  return setProgress(analysisEntry);
}

async function compileAnalysisTable(
  respStatus: string,
  respData: AnalysisNode[] | undefined,
) {
  tableLoading.value = true;
  await parseProjects();
  await getKongRoutes();
  const parsedAnalyses = new Map<string, ModifiedAnalysisNode>();
  const currentRunStatuses = await getRunStatusesFromPodOrc();

  let analysisData: AnalysisNode[] | undefined;
  if (respStatus === "success") {
    analysisCache.value = respData;
    analysisData = respData;
  } else {
    showCacheWarningToast(toast);
    analysisData = analysisCache.value;
  }

  const formattedAnalyses = formatDataRow(
    analysisData,
    ["created_at", "updated_at"],
    expandRowEntries,
  );
  if (projMap.size > 0) {
    formattedAnalyses.forEach((analysisEntry: ModifiedAnalysisNode) => {
      parsedAnalyses.set(
        analysisEntry.analysis_id,
        parseAnalysis(analysisEntry, currentRunStatuses),
      );
    });
    analysesMap.value = parsedAnalyses;
  }
  tableLoading.value = false;
}

onMounted(() => {
  compileAnalysisTable(status.value, analysisNodeResp.value);
  setInterval(checkForUpdatesFromPodOrc, 15000); // Poll PO every 15 seconds
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
    .catch(() => undefined)) as AnalysisNode[];
  if (nextSetResults.length > 0) {
    if (nextSetResults.length < queryLimit) {
      // Fewer than limit means we are at the end
      allResultsRetrieved = true;
    }
    currentOffset += queryLimit; // Increment offset value
    await compileAnalysisTable("success", nextSetResults);
  } else {
    // No results returned means all were retrieved
    allResultsRetrieved = true;
  }
}

// Table filters
const defaultFilters = {
  global: { value: undefined, matchMode: FilterMatchMode.CONTAINS },
  approval_status: { value: undefined, matchMode: FilterMatchMode.EQUALS },
  "analysis.build_status": { value: undefined, matchMode: FilterMatchMode.IN },
  run_status: { value: undefined, matchMode: FilterMatchMode.IN },
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

function updateAnalysisRun(analysisId: string, newStatus: PodStatus | null) {
  if (analysesMap.value.has(analysisId)) {
    const analysisToUpdate = analysesMap.value.get(analysisId)!; // Tell typescript we are sure there is a value
    analysisToUpdate.run_status = newStatus;
    analysesMap.value.set(analysisId, setProgress(analysisToUpdate));
  }
}

function updateRunStatusFilter(filterText: string) {
  const currentRunStatusFilters = filters.value.run_status.value;
  if (!currentRunStatusFilters) {
    // If value is undefined then initialize with filter in array
    filters.value.run_status.value = [filterText];
  } else {
    // Already run status filters present
    if (currentRunStatusFilters.includes(filterText)) {
      // If filter already there, then remove it
      const filteredStatuses = currentRunStatusFilters.filter(
        (item) => item !== filterText,
      );
      if (filteredStatuses.length == 0) {
        // If empty array after filtering then set to undefined
        filters.value.run_status.value = undefined;
      } else {
        filters.value.run_status.value = filteredStatuses;
      }
    } else {
      // Apply filter since it isn't present
      filters.value.run_status.value.push(filterText);
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
  <div class="card analysisTable">
    <Card class="content-card">
      <template #title>Analyses</template>
      <template #content>
        <div class="analysis-description-box">
          <div class="analysis-description">
            <Message
              class="control-warning-message"
              icon="pi pi-exclamation-triangle"
              severity="warn"
            >
              Controls may be disabled!
            </Message>
            <p>
              If the image for the analysis is not yet
              <Tag
                :severity="'success'"
                :value="'finished'"
                style="margin-left: 0.5em; margin-right: 0.5em"
              />
              (see Build Status) or if a data store does not exist for the
              associated project, then the analysis cannot be started
            </p>
          </div>
          <div class="analysis-container-counter">
            <ContainerCounter
              :activeFilters="filters"
              :analyses="analyses"
              @applyRunStatusFilter="updateRunStatusFilter"
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
          :globalFilterFields="['analysis.name', 'project_name', 'node.name']"
          :pt="{
            table: 'table table-striped',
          }"
          :rows="10"
          :loading="tableLoading"
          :rowsPerPageOptions="[10, 20, 50]"
          :sortOrder="-1"
          :value="analyses"
          dataKey="id"
          filterDisplay="menu"
          paginator
          sortField="updated_at.timestamp"
          tableStyle="min-width: 50rem"
          @page="onPage"
          class="rounded-table"
        >
          <template #empty> No analyses found.</template>
          <Column v-if="expandRowEntries.length" expander style="width: 5rem" />
          <Column :sortable="true" field="analysis.name">
            <template #header>
              <span v-tooltip.top="'Name of the analysis'" class="help-text">
                <b>Name</b>
              </span>
            </template>
            <template #body="{ data }">
              <span v-tooltip.right="data.analysis_id" class="help-text">
                {{ data.analysis.name }}
              </span>
            </template>
          </Column>
          <Column
            :showAddButton="false"
            :showApplyButton="false"
            :showClearButton="false"
            :showFilterMatchModes="false"
            :showFilterOperator="false"
            field="approval_status"
          >
            <template #header>
              <span
                v-tooltip.top="'Whether the project was approved or rejected'"
                class="help-text"
              >
                <b>Approval Status</b>
              </span>
            </template>
            <template #body="{ data }">
              <Tag
                v-if="data.approval_status"
                :severity="getApprovalStatusSeverity(data.approval_status)"
                :value="data.approval_status"
              />
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <Select
                v-model="filterModel.value"
                :options="approvalStatuses"
                :showClear="true"
                class="p-column-filter"
                placeholder="Select One"
                @change="filterCallback()"
              >
                <template #option="slotProps">
                  <Tag
                    :severity="getApprovalStatusSeverity(slotProps.option)"
                    :value="slotProps.option"
                  />
                </template>
              </Select>
            </template>
          </Column>
          <Column
            :showAddButton="false"
            :showApplyButton="false"
            :showClearButton="false"
            :showFilterMatchModes="false"
            :showFilterOperator="false"
            field="analysis.build_status"
            filterField="analysis.build_status"
          >
            <template #header>
              <span
                v-tooltip.top="'Build stage of the analysis Docker image'"
                class="help-text"
              >
                <b>Build Status</b>
              </span>
            </template>
            <template #body="{ data }">
              <Tag
                v-if="data.analysis.build_status"
                :severity="getBuildStatusSeverity(data.analysis.build_status)"
                :value="data.analysis.build_status"
              />
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                v-model="filterModel.value"
                :options="buildStatuses"
                class="p-column-filter"
                display="chip"
                optionLabel=""
                placeholder="Any"
                @change="filterCallback()"
              >
                <template #option="slotProps">
                  <div class="flex align-items-center gap-2">
                    <Tag
                      v-if="slotProps.option"
                      :severity="getBuildStatusSeverity(slotProps.option)"
                      :value="slotProps.option"
                    />
                  </div>
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
            field="run_status"
            filterField="run_status"
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
                v-if="data.run_status"
                :severity="getRunStatusSeverity(data.run_status)"
                :value="data.run_status"
              />
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                v-model="filterModel.value"
                :options="runStatuses"
                class="p-column-filter"
                optionLabel=""
                placeholder="Any"
                @change="filterCallback()"
              >
                <template #option="slotProps">
                  <div class="flex align-items-center gap-2">
                    <Tag
                      v-if="slotProps.option"
                      :severity="getRunStatusSeverity(slotProps.option)"
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
              <div v-if="data.datastore" class="datastore-badge">
                <Badge class="w-8 h-8 rounded-full" severity="success"
                  ><i v-tooltip.top="'Data store found'" class="pi pi-check"></i
                ></Badge>
              </div>
              <div v-else class="datastore-badge">
                <Badge
                  class="w-8 h-8 rounded-full"
                  :severity="datastoreBadgeSeverity"
                  ><i
                    v-tooltip.top="datastoreBadgeTooltip"
                    class="pi pi-times"
                  ></i
                ></Badge>
              </div>
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
                  data.run_status === AnalysisNodeRunStatus.Running &&
                  !data.progress
                    ? 'indeterminate'
                    : 'determinate'
                "
                :style="determineProgressBarColor(data.progress)"
                :value="data.progress"
              />
            </template>
          </Column>
          <Column :exportable="false" field="expand.id" style="min-width: 13em">
            <template #header>
              <span
                v-tooltip.top="'Controls for the analysis container'"
                class="help-text"
              >
                <b>Analysis Controls</b>
              </span>
            </template>
            <template #body="slotProps">
              <div
                v-if="slotProps.data.approval_status === 'approved'"
                class="control-buttons"
              >
                <AnalysisControlButtons
                  :analysisBuildStatus="slotProps.data.analysis.build_status"
                  :analysisId="slotProps.data.analysis_id"
                  :analysisNodeId="slotProps.data.id"
                  :analysisRunStatus="slotProps.data.run_status"
                  :datastore="slotProps.data.datastore"
                  :nodeId="slotProps.data.node_id"
                  :requireDatastore="datastoreRequired!"
                  :projectId="slotProps.data.analysis.project_id"
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
.control-warning-message {
  align-items: center;
  display: inline-flex;
  justify-content: center;
  border: 1px solid #eab308;
}

.p-tooltip {
  max-width: none !important;
  white-space: nowrap !important;
}

.p-tooltip-text {
  width: auto !important;
  display: inline-block;
}

.nav-btn {
  margin-top: 10px;
}

.datastore-badge {
  margin-left: 2em;
}

.analysis-description-box {
  display: flex;
  width: 100%;
}

.analysis-description {
  flex: 2;
}

.analysis-container-counter {
  flex: 1;
  display: flex;
  justify-content: right;
  align-items: flex-end;
}
</style>
