<script lang="ts" setup>
import { useToast } from "primevue/usetoast";
import { FilterMatchMode, FilterService } from "@primevue/core/api";
import { PodStatus } from "~/services/Api";
import { useAnalyses } from "~/composables/useAnalyses";
import { useDataStoreRequirement } from "~/composables/useDataStoreRequirement";
import {
  getHubStatusSeverity,
  HUB_STATUS_FILTER_MATCH_MODE,
  hubStatusFilterOptions,
  matchesHubStatusFilter,
  podStatuses,
  toggleStatusFilter,
} from "~/utils/analysis-filters";
import { determineProgressBarColor } from "~/utils/analysis-row";
import {
  getApprovalStatusSeverity,
  getBuildStatusSeverity,
  getExecutionStatusSeverity,
} from "~/utils/status-tag-severity";

const toast = useToast();

const { nodeType, requireDataStore: datastoreRequired } =
  useDataStoreRequirement();

const filters = ref();

FilterService.register(HUB_STATUS_FILTER_MATCH_MODE, matchesHubStatusFilter);

const {
  analyses,
  tableLoading,
  status,
  refreshTable,
  onPage,
  updateAnalysisRun,
} = await useAnalyses();

const defaultFilters = {
  global: { value: undefined, matchMode: FilterMatchMode.CONTAINS },
  hub_statuses: { value: undefined, matchMode: HUB_STATUS_FILTER_MATCH_MODE },
  executionStatus: { value: undefined, matchMode: FilterMatchMode.IN },
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

function updateExecutionStatusFilter(filterText: string) {
  filters.value.executionStatus.value = toggleStatusFilter(
    filters.value.executionStatus.value,
    filterText,
  );
}

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
  <div class="analysis-description-box description-box">
    <div class="analysis-description">
      <slot name="description" />
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
        @click="refreshTable"
      />
    </div>
  </div>
  <DataTable
    v-model:filters="filters"
    :globalFilterFields="['analysis_name', 'project_name']"
    :loading="tableLoading"
    :rows="10"
    :rowsPerPageOptions="[10, 20, 50]"
    :sortOrder="-1"
    :value="analyses"
    class="rounded-table analysis-table structured-table"
    dataKey="id"
    filterDisplay="menu"
    paginator
    sortField="updatedAt.timestamp"
    stripedRows
    tableStyle="min-width: 50rem"
    @page="onPage"
  >
    <template #empty> No analyses found.</template>
    <Column :sortable="true" field="analysis_name">
      <template #header>
        <span v-tooltip.top="'Name of the analysis'" class="help-text">
          <b>Name</b>
        </span>
      </template>
      <template #body="{ data }">
        <span v-tooltip.right="data.analysisId" class="help-text">
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
              v-if="data.approvalStatus"
              :severity="getApprovalStatusSeverity(data.approvalStatus)"
              :value="data.approvalStatus"
            />
            <span v-else class="hub-status-empty">—</span>
          </div>
          <div class="hub-status-line">
            <span class="hub-status-label">Build Status</span>
            <Tag
              v-if="data.analysis.buildStatus"
              :severity="getBuildStatusSeverity(data.analysis.buildStatus)"
              :value="data.analysis.buildStatus"
            />
            <span v-else class="hub-status-empty">—</span>
          </div>
          <div class="hub-status-line">
            <span class="hub-status-label">Distribution Status</span>
            <Tag
              v-if="data.analysis.distributionStatus"
              :severity="
                getBuildStatusSeverity(data.analysis.distributionStatus)
              "
              :value="data.analysis.distributionStatus"
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
      field="executionStatus"
      filterField="executionStatus"
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
          v-if="data.executionStatus"
          :severity="getExecutionStatusSeverity(data.executionStatus)"
          :value="data.executionStatus"
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
        <span v-tooltip.top="data.analysis.projectId" class="help-text">
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
          :hasDataStore="!!data.datastore"
          :projectId="data.analysis.projectId"
          :required="datastoreRequired!"
          @createDataStore="onCreateDataStore"
        />
      </template>
    </Column>
    <Column :sortable="true" dataType="date" field="createdAt.timestamp">
      <template #header>
        <span
          v-tooltip.top="'Date the analysis image was created'"
          class="help-text"
        >
          <b>Created On</b>
        </span>
      </template>
      <template #body="{ data }">
        <p v-tooltip.top="data.createdAt.long">
          {{ data.createdAt.short }}
        </p>
      </template>
    </Column>
    <Column :sortable="true" dataType="date" field="updatedAt.timestamp">
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
        <p v-tooltip.top="data.updatedAt.long">
          {{ data.updatedAt.short }}
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
            data.executionStatus === PodStatus.Executing &&
            !data.executionProgress
              ? 'indeterminate'
              : 'determinate'
          "
          :style="
            data.executionStatus === PodStatus.Executing &&
            !data.executionProgress
              ? {}
              : determineProgressBarColor(data.executionProgress)
          "
          :value="data.executionProgress"
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
            :analysisBuildStatus="slotProps.data.analysis.buildStatus"
            :analysisDistributionStatus="
              slotProps.data.analysis.distributionStatus
            "
            :analysisExecutionStatus="slotProps.data.executionStatus"
            :analysisId="slotProps.data.analysisId"
            :analysisNodeId="slotProps.data.id"
            :approvalStatus="slotProps.data.approvalStatus"
            :datastore="slotProps.data.datastore"
            :nodeId="slotProps.data.nodeId"
            :projectId="slotProps.data.analysis.projectId"
            :requireDatastore="datastoreRequired!"
            @missingDataStore="showDataStoreNavToast"
            @updateAnalysisRow="updateAnalysisRun"
          />
        </div>
      </template>
    </Column>
  </DataTable>
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
