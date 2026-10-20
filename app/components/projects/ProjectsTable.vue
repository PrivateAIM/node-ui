<script lang="ts" setup>
import { FilterMatchMode } from "@primevue/core/api";
import { useDataStoreRequirement } from "~/composables/useDataStoreRequirement";
import { useProjects } from "~/composables/useProjects";
import {
  METER_BUCKETS,
  meterSegments,
  meterTooltip,
} from "~/utils/project-status-meter";

const filters = ref();

const { nodeType, requireDataStore } = useDataStoreRequirement();
const { projects, status, summariesLoading, truncated, refreshTable } =
  await useProjects();

function onCreateDataStore(projectId?: string | null) {
  navigateTo({
    path: "/data-stores/create",
    query: projectId ? { projectId } : undefined,
  });
}

const defaultFilters = {
  global: { value: undefined, matchMode: FilterMatchMode.CONTAINS },
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
        @click="refreshTable"
      />
    </div>
  </div>
  <Message
    v-if="truncated"
    class="status-truncation-warning"
    icon="pi pi-exclamation-triangle"
    severity="warn"
  >
    More analyses are registered on this node than can be loaded at once. The
    analysis counts and statuses below are partial and exclude the least
    recently updated analyses.
  </Message>
  <DataTable
    v-model:filters="filters"
    :globalFilterFields="['id', 'project_name', 'node.name']"
    :rows="10"
    :rowsPerPageOptions="[10, 20, 50]"
    :sortOrder="1"
    :value="projects"
    class="rounded-table project-table structured-table"
    dataKey="id"
    filterDisplay="menu"
    paginator
    sortField="project_name"
    tableStyle="min-width: 50rem"
  >
    <template #empty> No projects found.</template>
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
          <b>Nodes</b>
        </span>
      </template>
    </Column>
    <Column>
      <template #header>
        <span
          v-tooltip.top="
            'Distribution of this project\'s analyses on this node'
          "
          class="help-text"
        >
          <b>Analyses Overview</b>
        </span>
      </template>
      <template #body="{ data }">
        <div class="project-status">
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
    <Column :sortable="true" dataType="date" field="createdAt.timestamp">
      <template #header>
        <span
          v-tooltip.top="'Date the project was registered with the Hub'"
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
          v-tooltip.top="'Date the project was last modified'"
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
  </DataTable>
</template>

<style>
.status-truncation-warning {
  margin: 0.75rem 0;
}

.project-status {
  display: flex;
  align-items: center;
  min-width: 8rem;
}

.status-meter {
  display: flex;
  width: 100%;
  height: 0.6375rem;
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
