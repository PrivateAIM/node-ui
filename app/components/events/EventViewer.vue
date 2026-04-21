<script setup lang="ts">
import { useNuxtApp } from "nuxt/app";
import { FilterMatchMode } from "@primevue/core/api";
import { useToast } from "primevue/usetoast";
import SearchBar from "~/components/table/SearchBar.vue";
import MeterGroup from "primevue/metergroup";
import Chip from "primevue/chip";
import { EventLogLevelTag, type EventTag } from "~/types/eventTag";
import TagFilterSidePanel from "~/components/events/TagFilterSidePanel.vue";
import { ServiceTag, type EventLog, type EventLogResponse, type Meta } from "~/services/Api";
import DateFilterGraph from "~/components/events/DateFilterGraph.vue";

const toast = useToast();

const FETCH_LIMIT = 50;

const events = ref<EventLog[]>([]);
const meta = ref<Meta>({ count: 0, total: 0, limit: FETCH_LIMIT, offset: 0 });
const loading = ref(false);

const startDate = ref<Date>();
const endDate = ref<Date>();
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

const filters = ref<{
  global: { value: string | undefined; matchMode: string };
}>({
  global: { value: undefined, matchMode: FilterMatchMode.CONTAINS },
});

const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "short",
  timeStyle: "long",
});

// --- Filtering ---

const selectedLevelFilters = computed(() =>
  appliedFilters.value
    .filter((f) =>
      Object.values(EventLogLevelTag).includes(f as EventLogLevelTag),
    )
    .map((f) => f.toLowerCase()),
);

const selectedServiceFilters = computed(() =>
  appliedFilters.value.filter((f) =>
    Object.values(ServiceTag).includes(f as ServiceTag),
  ),
);

const displayedEvents = computed(() => {
  let result = events.value;

  if (selectedLevelFilters.value.length > 0) {
    result = result.filter((e) =>
      selectedLevelFilters.value.includes(e.level?.toLowerCase()),
    );
  }

  if (selectedServiceFilters.value.length > 0) {
    result = result.filter((e) =>
      selectedServiceFilters.value.includes(e.service as ServiceTag),
    );
  }

  return result;
});

const allLoaded = computed(() => events.value.length >= meta.value.total);

// --- Pagination / API ---

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 16);
}

function buildQuery(offset: number) {
  return {
    limit: FETCH_LIMIT,
    offset,
    ...(startDate.value && { start_date: formatDate(startDate.value) }),
    ...(endDate.value && { end_date: formatDate(endDate.value) }),
  };
}

async function fetchEvents(offset: number, reset: boolean) {
  loading.value = true;
  const resp = (await useNuxtApp()
    .$hubApi("/events", {
      method: "GET",
      query: buildQuery(offset),
    })
    .catch(() => {
      toast.add({
        severity: "error",
        summary: "Event Fetch Failed",
        detail: "Unable to fetch events from the server",
        life: 5000,
      });
      return undefined;
    })) as EventLogResponse | undefined;

  if (resp) {
    events.value = reset ? resp.data : [...events.value, ...resp.data];
    meta.value = resp.meta;
    updateLogLevelCounts();
  }

  loading.value = false;
}

onMounted(() => {
  fetchEvents(0, true);
});

function onPage(event: { page: number; rows: number }) {
  if (allLoaded.value) return;

  const loadedPages = Math.ceil(events.value.length / event.rows);
  const currentPage = event.page + 1;

  if (currentPage >= loadedPages - 1) {
    fetchEvents(events.value.length, false);
  }
}

function handleDateFilterApply(start: Date | undefined, end: Date | undefined) {
  startDate.value = start;
  endDate.value = end;
  fetchEvents(0, true);
}

// --- Log level meter ---

function updateLogLevelCounts(eventList: EventLog[] = displayedEvents.value) {
  const updatedCounts = new Map(
    logLevelDistributions.value.map((dist) => [
      dist.label,
      { ...dist, value: 0 },
    ]),
  );

  eventList.forEach((event) => {
    const level = event.level?.toLowerCase();
    updatedCounts.forEach((dist) => {
      if (level === dist.label.toLowerCase()) {
        dist.value++;
      }
    });
  });

  logLevelDistributions.value = Array.from(updatedCounts.values());
}

watch(displayedEvents, (newList) => {
  updateLogLevelCounts(newList);
});

// --- Formatting helpers ---

function formatTag(tag: string, isLevel: boolean) {
  if (isLevel) {
    return {
      background: logLevelColorMap.get(tag as EventLogLevelTag) ?? "#8b5cf6",
      color: "#ffffff",
    };
  }
  return { background: "#14b8a6", color: "#ffffff" };
}

function formatEventName(eventName: string): string {
  return eventName.toUpperCase().split(".").join("-");
}

function formatTimestamp(timestamp: string): string | undefined {
  try {
    const date = new Date(timestamp);
    const formattedDateTime = dateTimeFormat.format(date);
    const [dateString, timeString] = formattedDateTime.split(", ");
    return `${dateString}<br><b>${timeString}</b>`;
  } catch (error) {
    console.error(`Timestamp: ${timestamp}; Error: ${error}`);
  }
}

function getLogLevelColor(level: string | undefined): string {
  if (!level) return "transparent";

  const normalized = level.toLowerCase();
  for (const [tag, color] of logLevelColorMap) {
    if (tag.toLowerCase() === normalized) return color;
  }
  return "transparent";
}

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
  <div class="event-viewer-container">
    <Card class="content-card event-viewer-card">
      <template #content>
        <div class="event-viewer-filter-panel-box">
          <DateFilterGraph
            :eventCount="eventCountDisplay"
            :loading="loading"
            @applyDateFilter="handleDateFilterApply"
          />
        </div>
        <div class="log-distribution-meter">
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
