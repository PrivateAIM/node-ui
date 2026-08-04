<script lang="ts" setup>
import { getProjectNodes } from "~/composables/useAPIFetch";
import { useDatastoreRequirement } from "~/composables/useDatastoreRequirement";
import { useProjectAnalysisSummary } from "~/composables/useProjectAnalysisSummary";
import { formatDataRow } from "~/utils/format-data-row";
import {
  deriveProjectStatus,
  PROJECT_STATUS_FILTER_OPTIONS,
  type ProjectAnalysisSummary,
  type ProjectStatus
} from "~/utils/summarise-project-analyses";
import { type ProjectNode } from "~/services/Api";
import { FilterMatchMode } from "@primevue/core/api";
import Message from "primevue/message";
import SearchBar from "~/components/table/SearchBar.vue";
import DataStoreBadge from "~/components/shared/DataStoreBadge.vue";

const proposals = ref();
const expandedRows = ref({});

const dataRowUnixCols = ["created_at", "updated_at"];
const expandRowEntries = [];

const filters = ref();

const { nodeType, requireDataStore } = useDatastoreRequirement();
const {
  loading: summariesLoading,
  truncated,
  refreshSummaries,
  summaryFor,
} = useProjectAnalysisSummary();

const METER_BUCKETS = [
  { key: "executed", label: "Executed" },
  { key: "running", label: "Running" },
  { key: "waiting", label: "Waiting on Hub" },
  { key: "stopped", label: "Stopped" },
  { key: "failed", label: "Failed" },
  { key: "idle", label: "Idle" },
] as const;

function meterSegments(summary: ProjectAnalysisSummary) {
  return METER_BUCKETS.filter((bucket) => summary[bucket.key] > 0).map(
    (bucket) => ({ ...bucket, count: summary[bucket.key] }),
  );
}

function meterTooltip(summary: ProjectAnalysisSummary) {
  return meterSegments(summary)
    .map((segment) => `${segment.count} ${segment.label.toLowerCase()}`)
    .join(", ");
}

const { data: response, status, refresh } = await getProjectNodes();

function parseData() {
  if (status.value === "success") {
    const formatted = formatDataRow(
      response.value,
      dataRowUnixCols,
      expandRowEntries,
    ) as unknown as
      | Array<
          ProjectNode & {
            project_name?: string | null;
            summary?: ProjectAnalysisSummary;
            project_status?: ProjectStatus;
          }
        >
      | undefined;
    formatted?.forEach((row) => {
      row.project_name =
        row.project?.display_name ?? row.project?.name ?? row.project?.id;
      row.summary = summaryFor(row.project?.id);
      row.project_status = deriveProjectStatus(
        row.summary,
        requireDataStore.value,
      );
    });
    proposals.value = formatted;
  }
}

await refreshSummaries();
parseData();

watch(requireDataStore, () => parseData());

async function onTableRefresh() {
  await Promise.all([refresh(), refreshSummaries()]);
  parseData();
}

function onCreateDataStore(projectId?: string | null) {
  navigateTo({
    path: "/data-stores/create",
    query: projectId ? { projectId } : undefined,
  });
}

// Table filters
const defaultFilters = {
  global: { value: undefined, matchMode: FilterMatchMode.CONTAINS },
  "project_status.key": { value: undefined, matchMode: FilterMatchMode.IN },
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
</script>

<template>
  <ConfirmDialog />
  <div class="proposal-card">
    <Card class="content-card">
      <template #title>Projects</template>
      <template #content>
        <div class="table-header-row">
          <SearchBar
            :searchTerm="defaultFilters.global.value"
            @clearFilters="resetFilters"
            @updateSearch="updateFilters"
          />
          <div class="status-legend">
            <span
              v-for="bucket in METER_BUCKETS"
              :key="bucket.key"
              class="status-legend-item"
            >
              <i :class="`status-meter-seg status-meter-${bucket.key}`" />
              {{ bucket.label }}
            </span>
          </div>
          <div class="card flex justify-content-center refresh-switch">
            <Button
              v-tooltip.top="'Refresh table'"
              :loading="status === 'pending' || summariesLoading"
              aria-label="Refresh table"
              icon="pi pi-refresh"
              severity="contrast"
              @click="onTableRefresh"
            />
          </div>
        </div>
        <Message
          v-if="truncated"
          class="status-truncation-warning"
          icon="pi pi-exclamation-triangle"
          severity="warn"
        >
          More analyses are registered on this node than can be loaded at once.
          The analysis counts and statuses below are partial and exclude the
          least recently updated analyses.
        </Message>
        <DataTable
          v-model:expandedRows="expandedRows"
          v-model:filters="filters"
          :globalFilterFields="['id', 'project_name', 'node.name']"
          :rows="10"
          :rowsPerPageOptions="[10, 20, 50]"
          :sortOrder="1"
          :value="proposals"
          class="rounded-table project-table structured-table"
          dataKey="id"
          filterDisplay="menu"
          paginator
          sortField="project_status.rank"
          tableStyle="min-width: 50rem"
        >
          <template #empty> No projects found.</template>
          <Column v-if="expandRowEntries.length" expander style="width: 5rem" />
          <Column :sortable="true" field="project_name" style="width: 20rem">
            <template #header>
              <span v-tooltip.top="'Name of the project'" class="help-text">
                <b>Project Name</b>
              </span>
            </template>
            <template #body="{ data }">
              <span v-tooltip.right="data.project?.id" class="help-text">
                {{ data.project_name }}
              </span>
            </template>
          </Column>
          <Column :sortable="true" field="summary.total">
            <template #header>
              <span
                v-tooltip.top="
                  'Number of analyses from this project registered on this node'
                "
                class="help-text"
              >
                <b>Analyses</b>
              </span>
            </template>
          </Column>
          <Column :sortable="true" field="project.nodes">
            <template #header>
              <span
                v-tooltip.top="'Number of nodes associated with this project'"
                class="help-text"
              >
                <b>Number of Nodes</b>
              </span>
            </template>
          </Column>
          <Column
            :showAddButton="false"
            :showApplyButton="false"
            :showClearButton="false"
            :showFilterMatchModes="false"
            :showFilterOperator="false"
            :sortable="true"
            field="project_status.rank"
            filterField="project_status.key"
          >
            <template #header>
              <span
                v-tooltip.top="
                  'What needs attention in this project on this node'
                "
                class="help-text"
              >
                <b>Status</b>
              </span>
            </template>
            <template #body="{ data }">
              <div class="project-status">
                <Tag
                  :severity="data.project_status.severity"
                  :value="data.project_status.label"
                />
                <div
                  v-if="data.summary.total > 0"
                  v-tooltip.top="meterTooltip(data.summary)"
                  :aria-label="meterTooltip(data.summary)"
                  class="status-meter"
                  role="img"
                >
                  <span
                    v-for="segment in meterSegments(data.summary)"
                    :key="segment.key"
                    :class="`status-meter-seg status-meter-${segment.key}`"
                    :style="{ flexGrow: segment.count }"
                  />
                </div>
              </div>
            </template>
            <template #filter="{ filterModel, filterCallback }">
              <MultiSelect
                v-model="filterModel.value"
                :options="PROJECT_STATUS_FILTER_OPTIONS"
                class="p-column-filter"
                optionLabel="label"
                optionValue="value"
                placeholder="Any status"
                @change="filterCallback()"
              />
            </template>
          </Column>
          <Column
            :hidden="nodeType === 'aggregator'"
            :sortable="true"
            field="summary.hasDataStore"
          >
            <template #header>
              <span
                v-tooltip.top="'Whether the project has a data store'"
                class="help-text"
              >
                <b>Data Store</b>
              </span>
            </template>
            <template #body="{ data }">
              <DataStoreBadge
                :hasDataStore="data.summary.hasDataStore"
                :projectId="data.project?.id"
                :required="requireDataStore"
                @createDataStore="onCreateDataStore"
              />
            </template>
          </Column>
          <Column :sortable="true" dataType="date" field="created_at.timestamp">
            <template #header>
              <span
                v-tooltip.top="'Date the project was registered with the Hub'"
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
                v-tooltip.top="'Date the project was last modified'"
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
        </DataTable>
      </template>
    </Card>
  </div>
</template>

<style>
.status-truncation-warning {
  margin: 0.75rem 0;
}

.project-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  min-width: 8rem;
}

.status-meter {
  display: flex;
  width: 100%;
  height: 0.4375rem;
  border-radius: 0.25rem;
  overflow: hidden;
}

.status-meter-seg {
  display: block;
  min-width: 0.125rem;
}

.status-meter-executed {
  background: #22c55e;
}

.status-meter-running {
  background: #3b82f6;
}

.status-meter-waiting {
  background: #f59e0b;
}

.status-meter-stopped {
  background: #fb4d1c;
}

.status-meter-failed {
  background: #ef4444;
}

.status-meter-idle {
  background: #4b5563;
}

.status-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.875rem;
  align-items: center;
  font-size: 0.6875rem;
  width: 100%;
  margin-top: 0.5rem;
}

.status-legend-item i {
  width: 0.5625rem;
  height: 0.5625rem;
  border-radius: 0.125rem;
  margin-right: 0.3125rem;
  display: inline-block;
  vertical-align: middle;
}
</style>
