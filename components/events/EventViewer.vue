<script setup lang="ts">
import { getEvents } from "~/composables/useAPIFetch";
import type { EventLogResponse } from "~/services/Api";
import { FilterMatchMode } from "@primevue/core/api";
import SearchBar from "~/components/table/SearchBar.vue";
import {
  EventLogLevelTag,
  EventMiscTag,
  EventServiceTag,
  type EventTag
} from "~/types/eventTag";
import FilterPanel from "~/components/events/FilterPanel.vue";

const events = ref<EventLogResponse[] | null>(null);

const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
  timeStyle: "long"
});
const filters = ref();

const { data: response, status } = await getEvents();

function parseData() {
  if (status.value === "success") {
    events.value = response.value;
  }
}

onMounted(() => {
  parseData();
});

// function updateTable(newData: ProjectNode) {
//   for (let row of proposals.value) {
//     if (row.id === newData.id) {
//       row.approval_status = newData.approval_status;
//       return;
//     }
//   }
// }

function formatTag(tagName: EventTag) {
  const isService = Object.values(EventServiceTag).includes(tagName);
  const isLogLevel = Object.values(EventLogLevelTag).includes(tagName);
  const isMisc = Object.values(EventMiscTag).includes(tagName);
  if (isService) {
    return { background: "#14b8a6", color: "#ffffff" };
  } else if (isLogLevel) {
    return { background: "#ec4899", color: "#ffffff" };
  } else if (isMisc) {
    return { backgroundColor: "#f59e0b", color: "#ffffff" };
  } else {
    return { backgroundColor: "#8b5cf6", color: "#ffffff" };
  }
}

function formatEventName(eventName: string): string {
  const eventChunks = eventName.toUpperCase().split(".");
  return eventChunks.join("-");
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const formattedDateTime = dateTimeFormat.format(date);
  const [dateString, timeString] = formattedDateTime.split(", ");

  return `${dateString}<br><b>${timeString}</b>`;
}

// Table filters
const defaultFilters = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  approval_status: { value: null, matchMode: FilterMatchMode.EQUALS }
};

filters.value = defaultFilters;

function resetFilters() {
  const clearedFilters = {};
  for (const filterKey in defaultFilters) {
    clearedFilters[filterKey] = {
      ...defaultFilters[filterKey]
    };
    clearedFilters[filterKey].value = null;
  }
  filters.value = clearedFilters;
}

const updateFilters = (filterText: string) => {
  filters.value.global.value = filterText;
};
</script>

<template>
  <div class="event-viewer-container">
    <Card class="content-card event-viewer-card">
      <template #title>Node Events</template>
      <template #content>
        <div class="event-viewer-description-box">
          <div class="event-viewer-description">
            <p>This page displays a collection of logged events.</p>
          </div>
        </div>
        <div class="table-header-row">
          <div class="table-header-row-filter-chips">
            <Chip label="Thriller" removable />
          </div>
          <div class="table-header-row-searchbar">
            <SearchBar
              :searchTerm="defaultFilters.global.value"
              @clearFilters="resetFilters"
              @updateSearch="updateFilters"
            />
          </div>
        </div>
        <div class="event-viewer-components">
          <div class="event-viewer-component-filter-panel">
            <FilterPanel />
          </div>
          <div class="event-viewer-component-event-table">
            <DataTable
              v-model:filters="filters"
              :globalFilterFields="['event_name', 'service_name', 'body']"
              :rows="10"
              :rowsPerPageOptions="[10, 20, 50]"
              :value="events"
              dataKey="id"
              filterDisplay="menu"
              stripedRows
              showGridlines
              resizableColumns
              columnResizeMode="fit"
              paginator
              tableStyle="min-width: 50rem"
              class="rounded-table"
            >
              <template #empty> No events found.</template>
              <Column
                field="timestamp"
                :sortable="true"
                dataType="date"
                header="DateTime"
              >
                <template #body="{ data }">
                  <div class="event-entry-datetime">
                    <span v-html="formatTimestamp(data.timestamp)" />
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
                      <div
                        class="event-entry-title-tags"
                        v-if="
                          data.attributes.tags &&
                          data.attributes.tags.length > 0
                        "
                      >
                        <Tag
                          v-bind="data.tags"
                          v-for="(tag, index) in data.attributes.tags"
                          :key="index"
                          :severity="'success'"
                          :value="tag"
                          :style="formatTag(tag)"
                        />
                      </div>
                    </div>
                    <div class="event-entry-cell-body">
                      <span>
                        {{ data.body }}
                      </span>
                    </div>
                  </div>
                </template>
              </Column>
            </DataTable>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped lang="scss">
.event-viewer-components {
  display: flex;
  gap: 1rem;
}

.event-viewer-component-event-table {
  flex: 1;
}

.event-entry-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.event-entry-title-name {
  flex: 1; // Takes up available space
  min-width: 0; // Allows text truncation if needed
  font-weight: bold;
}

.event-entry-title-tags {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0; // Prevents tags from shrinking
}

.event-table-event-column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}
</style>
