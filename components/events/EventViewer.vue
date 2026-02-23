<script setup lang="ts">
import { getEvents } from "~/composables/useAPIFetch";
import { FilterMatchMode, FilterService } from "@primevue/core/api";
import SearchBar from "~/components/table/SearchBar.vue";
import MeterGroup from "primevue/metergroup";
import Chip from "primevue/chip";
import {
  EventLogLevelTag,
  EventServiceTag,
  type EventTag,
} from "~/types/eventTag";
import TagFilterSidePanel from "~/components/events/TagFilterSidePanel.vue";
import type { EventLog, EventLogResponse } from "~/services/Api";
import DateFilterGraph from "~/components/events/DateFilterGraph.vue";
import type { DataTableFilterEvent } from "primevue";

const events = ref<EventLog[]>([]);
const eventCount = ref<number>(0);
const filteredEventCount = ref<number>(0); // Track filtered count separately since its temporary

const appliedFilters = ref<EventTag[]>([]);

const logLevelColorMap = new Map([
  [EventLogLevelTag.Error, "#ef4444"],
  [EventLogLevelTag.Warning, "#eab308"],
  [EventLogLevelTag.Info, "#3b82f6"],
]);
const logLevelDistributions = ref(
  Array.from(logLevelColorMap, ([label, color]) => ({
    label,
    color,
    value: 0,
  })),
);

const filters = ref();

const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
  timeStyle: "long",
});

const { data: response, status } = await getEvents();

function parseData() {
  if (status.value === "success" && response.value) {
    events.value = response.value.data;
    eventCount.value = response.value.meta.count;
    updateLogLevelCounts();
  }
}

onMounted(() => {
  parseData();
});

function updateLogLevelCounts(eventList: EventLog[] = events.value) {
  // Reset counts with new array to force MeterGroup reactivity
  const updatedCounts = new Map(
    logLevelDistributions.value.map((dist) => [
      dist.label,
      { ...dist, value: 0 },
    ]),
  );

  if (eventList) {
    // Count occurrences
    eventList.forEach((event) => {
      const tags = event.attributes?.tags || [];

      updatedCounts.forEach((dist) => {
        if (tags.includes(dist.label)) {
          dist.value++;
        }
      });
    });
    logLevelDistributions.value = Array.from(updatedCounts.values());
  }
}

function formatTag(tagName: EventTag) {
  const isService = Object.values(EventServiceTag).includes(tagName);
  const isLogLevel = Object.values(EventLogLevelTag).includes(tagName);
  if (isService) {
    return { background: "#14b8a6", color: "#ffffff" };
  } else if (isLogLevel) {
    return { background: getLogLevelColor([tagName]), color: "#ffffff" };
  } else {
    return { background: "#8b5cf6", color: "#ffffff" };
  }
}

function formatEventName(eventName: string): string {
  const eventChunks = eventName.toUpperCase().split(".");
  return eventChunks.join("-");
}

function formatTimestamp(timestamp: string): string | undefined {
  try {
    const date = new Date(timestamp); // Python does not return timestamp with standard "Z"
    const formattedDateTime = dateTimeFormat.format(date);
    const [dateString, timeString] = formattedDateTime.split(", ");

    return `${dateString}<br><b>${timeString}</b>`;
  } catch (error) {
    console.error(`Timestamp: ${timestamp}; Error: ${error}`);
  }
}

function getLogLevelColor(tags: string[]): string | undefined {
  if (tags && tags.length > 0) {
    // Check for log level tags and go in order of severity
    for (const tag of [
      EventLogLevelTag.Error,
      EventLogLevelTag.Warning,
      EventLogLevelTag.Info,
    ]) {
      if (tags.includes(tag)) {
        return logLevelColorMap.get(tag);
      }
    }
  }
  return "transparent";
}

// Table filters
FilterService.register("tagsContainsAny", (value, filter) => {
  if (!filter || filter.length === 0) return true;
  if (!value || value.length === 0) return false;

  const selectedServices = filter.filter((f: EventTag) =>
    Object.values(EventServiceTag).includes(f),
  );
  const selectedLogLevels = filter.filter((f: EventTag) =>
    Object.values(EventLogLevelTag).includes(f),
  );

  const matchesService =
    selectedServices.length === 0 ||
    selectedServices.some((f: EventTag) => value.includes(f));

  const matchesLogLevel =
    selectedLogLevels.length === 0 ||
    selectedLogLevels.some((f: EventTag) => value.includes(f));

  return matchesService && matchesLogLevel;
});

const defaultFilters = {
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  "attributes.tags": { value: null, matchMode: "tagsContainsAny" },
};

filters.value = defaultFilters;

const updateFilters = (filterText: string) => {
  filters.value.global.value = filterText;
};

function clearAllFilters() {
  const clearedFilters = {};
  for (const filterKey in defaultFilters) {
    clearedFilters[filterKey] = {
      ...defaultFilters[filterKey],
    };
    clearedFilters[filterKey].value = null;
  }
  filters.value = clearedFilters;
  appliedFilters.value = [];
}

function handleRemoveFilterTag(tag: EventTag) {
  appliedFilters.value = appliedFilters.value.filter(
    (filter) => filter !== tag,
  );
}

function handleShowRequestEvents(requestedEvents: EventLogResponse) {
  events.value = requestedEvents.data;
  eventCount.value = requestedEvents.meta.count;
  updateLogLevelCounts();
}

function handleFilter(event: DataTableFilterEvent) {
  const filtered = event.filteredValue ?? [];
  filteredEventCount.value = filtered.length;
  updateLogLevelCounts(filtered);
}

watch(
  appliedFilters,
  (newFilters) => {
    if (newFilters.length > 0) {
      filters.value["attributes.tags"].value = newFilters;
    } else {
      filters.value["attributes.tags"].value = null;
    }
  },
  { deep: true },
);
</script>

<template>
  <div class="event-viewer-container">
    <Card class="content-card event-viewer-card">
      <template #content>
        <div class="event-viewer-filter-panel-box">
          <DateFilterGraph
            :eventCount="filteredEventCount || eventCount"
            @showRequestedEvents="handleShowRequestEvents"
          />
        </div>
        <div class="log-distribution-meter">
          <MeterGroup
            :value="logLevelDistributions"
            :max="filteredEventCount || eventCount"
          />
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
              :searchTerm="defaultFilters.global.value"
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
              @filter="handleFilter"
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
                style="width: 15em"
              >
                <template #body="{ data }">
                  <div
                    class="event-entry-datetime"
                    :style="{
                      borderLeft: `4px solid ${getLogLevelColor(data.attributes.tags)}`,
                      paddingLeft: '0.75rem',
                    }"
                  >
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

.log-distribution-meter {
  margin-top: 1rem;
}

.event-viewer-component-event-table {
  flex: 1;
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
