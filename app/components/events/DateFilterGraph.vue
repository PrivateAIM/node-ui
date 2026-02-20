<script setup lang="ts">
import { useNuxtApp } from "nuxt/app";
import DatePicker from "primevue/datepicker";
import Toolbar from "primevue/toolbar";
import FloatLabel from "primevue/floatlabel";
import { useToast } from "primevue/usetoast";
import type { EventLogResponse } from "~/services/Api";

const props = defineProps({
  eventCount: Number,
});

const toast = useToast();

const loading = ref<boolean>(false);

const startDate = ref<Date>();
const endDate = ref<Date>();

const emit = defineEmits(["showRequestedEvents"]);

function formatDate(date: Date | null): string | null {
  if (!date) {
    return null;
  } else {
    return date.toISOString().slice(0, 16); // cut off unnecessary stuff
  }
}

async function requestEvents() {
  loading.value = true;
  const eventResp = await useNuxtApp()
    .$hubApi("/events", {
      method: "GET",
      query: {
        ...(startDate.value && { start_date: formatDate(startDate.value) }), // the ... checks before adding to query
        ...(endDate.value && { end_date: formatDate(endDate.value) }),
      },
    })
    .catch(() => {
      toast.add({
        severity: "error",
        summary: "Event Fetch Failed",
        detail: "Unable to fetch events from database",
        life: 5000,
      });
      return null;
    });
  loading.value = false;
  if (eventResp) {
    emit("showRequestedEvents", eventResp as EventLogResponse);
  }
}
</script>

<template>
  <div class="custom-filter-header">
    <Toolbar>
      <template #start>
        <div class="custom-filter-header-start">
          <h2 class="font-bold">Event Viewer</h2>
        </div>
      </template>
      <template #center>
        <div class="custom-filter-header-center">
          <div class="custom-filter-date-container">
            <div class="custom-filter-startdate-form">
              <FloatLabel class="w-full" variant="on">
                <DatePicker
                  inputId="startdate_label"
                  v-model="startDate"
                  :invalid="startDate && endDate && endDate < startDate"
                  showIcon
                  showTime
                  hourFormat="24"
                  showClear
                  iconDisplay="input"
                />
                <label for="startdate_label">Start Date</label>
              </FloatLabel>
            </div>
            <div class="custom-filter-date-separator">
              <span>-</span>
            </div>
            <div class="custom-filter-enddate-form">
              <FloatLabel class="w-full" variant="on">
                <DatePicker
                  inputId="enddate_label"
                  v-model="endDate"
                  :invalid="startDate && endDate && endDate < startDate"
                  showIcon
                  showTime
                  hourFormat="24"
                  showClear
                  iconDisplay="input"
                />
                <label for="enddate_label">End Date</label>
              </FloatLabel>
            </div>
            <div class="custom-date-filter-submit-btn">
              <Button
                label="Apply"
                :loading="loading"
                :disabled="startDate && endDate && endDate < startDate"
                @click="requestEvents()"
              />
            </div>
          </div>
        </div>
      </template>
      <template #end>
        <div class="custom-filter-header-end">
          <span
            v-if="eventCount !== 1"
            v-tooltip.left="'Total number of events currently shown'"
          >
            <b> {{ props.eventCount }} events </b>
          </span>
          <span
            v-else
            v-tooltip.left="'Total number of events currently shown'"
          >
            <b> {{ props.eventCount }} event </b>
          </span>
        </div>
      </template>
    </Toolbar>
  </div>
</template>

<style scoped lang="scss">
.custom-filter-header-start h2 {
  margin-block-start: 0.5em;
  margin-block-end: 0.5em;
}

.custom-filter-date-container {
  display: flex;
  align-items: center;
}

.custom-filter-date-separator {
  margin: 0 1rem 0 1rem; // Left and right
  font-weight: bold;
  font-size: 1.25rem;
}

.custom-date-filter-submit-btn {
  margin-left: 1rem;
}
</style>
