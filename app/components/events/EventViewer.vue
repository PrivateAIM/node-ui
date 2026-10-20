<script setup lang="ts">
import { FilterMatchMode } from "@primevue/core/api";
import { useEvents } from "~/composables/useEvents";
import type { EventTag } from "~/types/eventTag";
import {
  countLogLevels,
  filterEventsByTags,
  formatEventName,
  formatTag,
  formatTimestampPart,
  getLogLevelColor,
} from "~/utils/event-format";

const { events, loading, onPage, applyDateFilter } = useEvents();

const appliedFilters = ref<EventTag[]>([]);

const filters = ref<{
  global: { value: string | undefined; matchMode: string };
}>({
  global: { value: undefined, matchMode: FilterMatchMode.CONTAINS },
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
});
const timeFormatter = new Intl.DateTimeFormat(undefined, { timeStyle: "long" });

const displayedEvents = computed(() =>
  filterEventsByTags(events.value, appliedFilters.value),
);

const logLevelDistributions = computed(() =>
  countLogLevels(displayedEvents.value),
);

const updateFilters = (filterText: string) => {
  filters.value.global.value = filterText;
};

function clearAllFilters() {
  filters.value.global.value = undefined;
  appliedFilters.value = [];
}

function handleRemoveFilterTag(tag: EventTag) {
  appliedFilters.value = appliedFilters.value.filter((f) => f !== tag);
}

const eventCountDisplay = computed(() => displayedEvents.value.length);
</script>

<template>
  <div class="event-viewer-filter-panel-box">
    <DateFilterGraph :loading="loading" @applyDateFilter="applyDateFilter" />
  </div>
  <div v-if="eventCountDisplay > 0" class="log-distribution-meter">
    <MeterGroup :value="logLevelDistributions" :max="eventCountDisplay" />
  </div>
  <div class="table-header-row">
    <div class="table-header-row-filter-chips-container">
      <div class="table-header-row-filter-chips-container-counter">
        <span
          ><b>FILTERS: ({{ appliedFilters.length }})</b></span
        >
      </div>
      <div class="table-header-row-filter-chips flex flex-wrap gap-2">
        <Chip
          v-for="appliedFilter in appliedFilters"
          :key="appliedFilter"
          :value="appliedFilter"
          :label="appliedFilter"
          removable
          @remove="handleRemoveFilterTag(appliedFilter)"
        />
      </div>
    </div>
    <div class="table-header-row-searchbar">
      <SearchBar
        :searchTerm="filters.global.value"
        @clearFilters="clearAllFilters"
        @updateSearch="updateFilters"
      />
    </div>
  </div>
  <div class="event-viewer-components">
    <div class="event-viewer-component-filter-panel">
      <TagFilterSidePanel
        v-model="appliedFilters"
        @clearTagFilter="
          () => {
            appliedFilters = [];
          }
        "
      />
    </div>
    <div class="event-viewer-component-event-table">
      <DataTable
        v-model:filters="filters"
        :globalFilterFields="['event_name', 'service', 'message', 'user']"
        :loading="loading"
        :rows="10"
        :rowsPerPageOptions="[10, 20, 50]"
        :value="displayedEvents"
        filterDisplay="menu"
        stripedRows
        showGridlines
        resizableColumns
        columnResizeMode="fit"
        paginator
        class="rounded-table"
        :sortOrder="-1"
        sortField="timestamp"
        @page="onPage"
      >
        <template #empty>No events found.</template>
        <Column
          field="timestamp"
          :sortable="true"
          dataType="date"
          header="DateTime"
          style="width: 15em"
        >
          <template #body="{ data }">
            <div
              class="event-entry-datetime"
              :style="{
                borderLeft: `4px solid ${getLogLevelColor(data.level)}`,
                paddingLeft: '0.75rem',
              }"
            >
              <span>{{
                formatTimestampPart(data.timestamp, dateFormatter)
              }}</span
              ><br /><b>{{
                formatTimestampPart(data.timestamp, timeFormatter)
              }}</b>
            </div>
          </template>
        </Column>
        <Column header="Event">
          <template #body="{ data }">
            <div class="event-entry-cell">
              <div class="event-entry-title">
                <div class="event-entry-title-name">
                  {{ formatEventName(data.event_name) }}
                </div>
                <div class="event-entry-title-tags">
                  <Tag
                    v-if="data.level"
                    :value="data.level"
                    :style="formatTag(data.level, true)"
                  />
                  <Tag
                    v-if="data.service"
                    :value="data.service"
                    :style="formatTag(data.service, false)"
                  />
                </div>
              </div>
              <div class="event-entry-cell-body">
                <span>{{ data.message }}</span>
              </div>
            </div>
          </template>
        </Column>
        <Column field="user" header="User" style="width: 10em">
          <template #body="{ data }">
            <span>{{ data.user ?? "—" }}</span>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<style scoped lang="scss">
.event-viewer-components {
  display: flex;
  gap: 1rem;
}

.log-distribution-meter {
  margin-top: 1rem;
}

.event-viewer-component-event-table {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.table-header-row-filter-chips-container {
  display: flex;
  align-items: center;
}

.table-header-row-filter-chips-container-counter {
  margin-right: 0.5rem;
}

.event-entry-datetime {
  transition: border-color 0.2s ease;
}

.event-entry-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.event-entry-title-name {
  flex: 1;
  min-width: 0;
  font-weight: bold;
  word-break: break-word;
}

.event-entry-cell-body {
  word-break: break-word;
  white-space: normal;
}

.event-entry-title-tags {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}
</style>
