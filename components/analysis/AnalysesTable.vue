<script setup lang="ts">
import { useFetch, useNuxtApp } from "#app";
import Badge from "primevue/badge";
import { useToast } from "primevue/usetoast";
import { getAnalysisNodes } from "~/composables/useAPIFetch";
import { formatDataRow } from "~/utils/format-data-row";
import { showHubAdapterConnectionErrorToast } from "~/composables/connectionErrorToast";
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
  type Project,
  type Route,
} from "~/services/Api";
import { AnalysisBuildStatus, AnalysisNodeRunStatus } from "~/types/analysis";
import { ApprovalStatus } from "~/types/node";
import ContainerCounter from "~/components/analysis/ContainerCounter.vue";

const toast = useToast();

const analyses = ref<ModifiedAnalysisNode[]>([]);

const expandRowEntries = [];
const expandedRows = ref();

// Filter settings
const filters = ref();

// Paginated table
let allResultsRetrieved = false;
const queryLimit = 50;
let currentOffset = 50; // Start with query limit and will increment by same amount

const kongRoutes = ref<Set<string>>(new Set());

// Imported values
const runStatuses = Object.values(AnalysisNodeRunStatus);
const approvalStatuses = Object.values(ApprovalStatus);
const buildStatuses = Object.values(AnalysisBuildStatus);

export interface ModifiedAnalysisNode extends AnalysisNode {
  project_name: string | undefined;
  expand: {
    [key: string]: string;
  };
  datastore: boolean;
}

const {
  data: analysisNodeResp,
  status,
  error,
  refresh,
} = await getAnalysisNodes(); // Get the first batch of 50
const { data: projData, status: projStatus } = await useFetch<Project[]>(
  "/projects",
  {
    $fetch: useNuxtApp().$hubApi,
    method: "GET",
    query: {
      sort: "-updated_at",
      fields: "id,name",
    },
  },
);

const kongProjectsResp = (await useNuxtApp()
  .$hubApi("/kong/project", {
    method: "GET",
  })
  .catch(() => null)) as ListRoutes;
if (kongProjectsResp && kongProjectsResp.data) {
  const projIds: string[] = [];
  kongProjectsResp.data.forEach((proj: Route) => {
    const nameChunks = proj.name?.split("-");
    if (nameChunks && nameChunks.length > 1) {
      nameChunks.pop(); // Remove suffix, either "fhir" or "s3"
      const projUuid = nameChunks.join("-");
      projIds.push(projUuid);
    }
  });
  kongRoutes.value = new Set(projIds);
}

// Iterate through projects and populate map with proj UUID: name
const projMap = new Map<string, string>();
if (projStatus.value === "success" && projData.value) {
  projData.value.forEach((proj: Project) => {
    if (proj.name) {
      projMap.set(proj.id!, proj.name);
    }
  });
}

function parseData(respStatus: string, respData: AnalysisNode[] | null) {
  if (respStatus === "success") {
    const formattedAnalyses = formatDataRow(
      respData,
      ["created_at", "updated_at"],
      expandRowEntries,
    );
    if (projMap.size > 0) {
      formattedAnalyses.forEach((analysisEntry: ModifiedAnalysisNode) => {
        const projId = analysisEntry.analysis?.project_id;
        if (projId) {
          analysisEntry.project_name = projMap.has(projId)
            ? projMap.get(projId)
            : "";
          analysisEntry.datastore = kongRoutes.value.has(projId);
        }
        analyses.value.push(analysisEntry);
      });
    }
  } else if (error.value?.statusCode === 500) {
    showHubAdapterConnectionErrorToast(toast, "Hub");
  }
}

parseData(status.value, analysisNodeResp.value);

async function onTableRefresh() {
  await refresh();
  parseData(status.value, analysisNodeResp.value);
}

function onPage(event) {
  const currentPage = event.page + 1;
  const currentNumberEntries = analyses.value.length;
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
    .catch(() => null)) as AnalysisNode[];
  if (nextSetResults.length > 0) {
    if (nextSetResults.length < queryLimit) {
      // Fewer than limit means we are at the end
      allResultsRetrieved = true;
    }
    currentOffset += queryLimit; // Increment offset value
    parseData("success", nextSetResults);
  } else {
    // No results returned means all were retrieved
    allResultsRetrieved = true;
  }
}

// Table filters
const defaultFilters = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  approval_status: { value: null, matchMode: FilterMatchMode.EQUALS },
  "analysis.build_status": { value: null, matchMode: FilterMatchMode.IN },
  run_status: { value: null, matchMode: FilterMatchMode.IN },
};
filters.value = defaultFilters;

function resetFilters() {
  console.log(filters.value.run_status);
  const clearedFilters = {};
  for (const filterKey in defaultFilters) {
    clearedFilters[filterKey] = {
      ...defaultFilters[filterKey],
    };
    clearedFilters[filterKey].value = null;
  }
  filters.value = clearedFilters;
}

const updateFilters = (filterText: string) => {
  filters.value.global.value = filterText;
};

function updateRunStatus(
  analysisNodeId: string,
  newStatus: AnalysisNode["run_status"],
) {
  for (let row of analyses.value as AnalysisNode[]) {
    if (row.id === analysisNodeId) {
      row.run_status = newStatus;
      break;
    }
  }
}

function updateRunStatusFilter(filterText: string) {
  const currentRunStatusFilters = filters.value.run_status.value;
  if (!currentRunStatusFilters) {
    // If value is null then initialize with filter in array
    filters.value.run_status.value = [filterText];
  } else {
    // Already run status filters present
    if (currentRunStatusFilters.includes(filterText)) {
      // If filter already there, then remove it
      const filteredStatuses = currentRunStatusFilters.filter(
        (item) => item !== filterText,
      );
      if (filteredStatuses.length == 0) {
        // If empty array after filtering then set to null
        filters.value.run_status.value = null;
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
      position="top-right"
      group="datastoreToastLink"
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
            @click="onNavigate"
            severity="info"
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
              severity="warn"
              class="control-warning-message"
              icon="pi pi-exclamation-triangle"
            >
              Some controls may be disabled!
            </Message>
            <p>
              If the image for the analysis is not yet
              <Tag
                style="margin-left: 0.5em; margin-right: 0.5em"
                :value="'finished'"
                :severity="'success'"
              />
              (see Build Status), a container for the analysis cannot be
              started.
            </p>
          </div>
          <div class="analysis-container-counter">
            <ContainerCounter
              :analyses="analyses"
              :activeFilters="filters"
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
              icon="pi pi-refresh"
              aria-label="Filter"
              :loading="status === 'pending'"
              v-tooltip.top="'Refresh table'"
              @click="onTableRefresh"
              severity="contrast"
            />
          </div>
        </div>
        <DataTable
          :value="analyses"
          v-model:expandedRows="expandedRows"
          dataKey="id"
          :pt="{
            table: 'table table-striped',
          }"
          paginator
          @page="onPage"
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          tableStyle="min-width: 50rem"
          v-model:filters="filters"
          filterDisplay="menu"
          :globalFilterFields="['analysis.name', 'project_name', 'node.name']"
          sortField="updated_at.timestamp"
          :sortOrder="-1"
        >
          <template #empty> No analyses found.</template>
          <Column expander style="width: 5rem" v-if="expandRowEntries.length" />
          <Column field="analysis.name" :sortable="true">
            <template #header>
              <span class="help-text" v-tooltip.top="'Name of the analysis'">
                <b>Name</b>
              </span>
            </template>
          </Column>
          <Column
            field="approval_status"
            :showFilterMatchModes="false"
            :showClearButton="false"
            :showApplyButton="false"
            :showFilterOperator="false"
            :showAddButton="false"
          >
            <template #header>
              <span
                class="help-text"
                v-tooltip.top="'Whether the project was approved or rejected'"
              >
                <b>Approval Status</b>
              </span>
            </template>
            <template #body="{ data }">
              <Tag
                v-if="data.approval_status"
                :value="data.approval_status"
                :severity="getApprovalStatusSeverity(data.approval_status)"
              />
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <Select
                v-model="filterModel.value"
                @change="filterCallback()"
                :options="approvalStatuses"
                placeholder="Select One"
                class="p-column-filter"
                :showClear="true"
              >
                <template #option="slotProps">
                  <Tag
                    :value="slotProps.option"
                    :severity="getApprovalStatusSeverity(slotProps.option)"
                  />
                </template>
              </Select>
            </template>
          </Column>
          <!--          <Column-->
          <!--            field="id"-->
          <!--            header="Set Approval"-->
          <!--            style="min-width: 10em"-->
          <!--            :exportable="false"-->
          <!--          >-->
          <!--            <template #body="slotProps">-->
          <!--              <ApproveRejectButtons-->
          <!--                :objectId="slotProps.data.id"-->
          <!--                :objectClass="'analysis'"-->
          <!--                @updatedRow="updateTable"-->
          <!--              />-->
          <!--            </template>-->
          <!--          </Column>-->
          <Column
            field="analysis.build_status"
            filterField="analysis.build_status"
            :showFilterMatchModes="false"
            :showClearButton="false"
            :showApplyButton="false"
            :showFilterOperator="false"
            :showAddButton="false"
          >
            <template #header>
              <span
                class="help-text"
                v-tooltip.top="'Build stage of the analysis Docker image'"
              >
                <b>Build Status</b>
              </span>
            </template>
            <template #body="{ data }">
              <Tag
                v-if="data.analysis.build_status"
                :value="data.analysis.build_status"
                :severity="getBuildStatusSeverity(data.analysis.build_status)"
              />
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                v-model="filterModel.value"
                @change="filterCallback()"
                :options="buildStatuses"
                optionLabel=""
                placeholder="Any"
                display="chip"
                class="p-column-filter"
              >
                <template #option="slotProps">
                  <div class="flex align-items-center gap-2">
                    <Tag
                      v-if="slotProps.option"
                      :value="slotProps.option"
                      :severity="getBuildStatusSeverity(slotProps.option)"
                    />
                  </div>
                </template>
              </MultiSelect>
            </template>
          </Column>
          <Column
            field="run_status"
            filterField="run_status"
            :showFilterMatchModes="false"
            :showClearButton="false"
            :showApplyButton="false"
            :showFilterOperator="false"
            :showAddButton="false"
          >
            <template #header>
              <span
                class="help-text"
                v-tooltip.top="'Current run status of the analysis container'"
              >
                <b>Run Status</b>
              </span>
            </template>
            <template #body="{ data }">
              <Tag
                v-if="data.run_status"
                :value="data.run_status"
                :severity="getRunStatusSeverity(data.run_status)"
              />
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                v-model="filterModel.value"
                @change="filterCallback()"
                :options="runStatuses"
                optionLabel=""
                placeholder="Any"
                class="p-column-filter"
              >
                <template #option="slotProps">
                  <div class="flex align-items-center gap-2">
                    <Tag
                      v-if="slotProps.option"
                      :value="slotProps.option"
                      :severity="getRunStatusSeverity(slotProps.option)"
                    />
                  </div>
                </template>
              </MultiSelect>
            </template>
          </Column>
          <Column field="project_name" :sortable="true">
            <template #header>
              <span
                class="help-text"
                v-tooltip.top="'Date the analysis image was created'"
              >
                <b>Project</b>
              </span>
            </template>
          </Column>
          <Column field="datastore" :sortable="true">
            <template #header>
              <span
                class="help-text"
                v-tooltip.top="'Whether the analysis has access to data'"
              >
                <b>Data Store</b>
              </span>
            </template>
            <template #body="{ data }">
              <div v-if="data.datastore" class="datastore-badge">
                <Badge severity="success" class="w-8 h-8 rounded-full"
                  ><i class="pi pi-check" v-tooltip.top="'Data store found'"></i
                ></Badge>
              </div>
              <div v-else class="datastore-badge">
                <Badge severity="danger" class="w-8 h-8 rounded-full"
                  ><i
                    class="pi pi-times"
                    v-tooltip.top="'Data store missing!'"
                  ></i
                ></Badge>
              </div>
            </template>
          </Column>
          <Column field="created_at.timestamp" dataType="date" :sortable="true">
            <template #header>
              <span
                class="help-text"
                v-tooltip.top="'Date the analysis image was created'"
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
          <Column field="updated_at.timestamp" dataType="date" :sortable="true">
            <template #header>
              <span
                class="help-text"
                v-tooltip.top="
                  'Date the analysis container on the node was last modified'
                "
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
          <Column field="expand.id" style="min-width: 13em" :exportable="false">
            <template #header>
              <span
                class="help-text"
                v-tooltip.top="'Controls for the analysis container'"
              >
                <b>Analysis Controls</b>
              </span>
            </template>
            <template #body="slotProps">
              <div
                class="control-buttons"
                v-if="slotProps.data.approval_status === 'approved'"
              >
                <AnalysisControlButtons
                  :analysisBuildStatus="slotProps.data.analysis.build_status"
                  :analysisRunStatus="slotProps.data.run_status"
                  :analysisNodeId="slotProps.data.id"
                  :analysisId="slotProps.data.analysis_id"
                  :projectId="slotProps.data.analysis.project_id"
                  :nodeId="slotProps.data.node_id"
                  @newRunStatus="updateRunStatus"
                  @missingDataStore="showDataStoreNavToast"
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
