<script setup lang="ts">
import Card from "primevue/card";
import DatePicker from "primevue/datepicker";
import Panel from "primevue/panel";
import FloatLabel from "primevue/floatlabel";
import { EventServiceTag } from "~/types/eventTag";
import { useToast } from "primevue/usetoast";
import type { EventLogResponse } from "~/services/Api";

// TODO Add MeterGroup comparing message types

const availableServices = Object.values(EventServiceTag);

const toast = useToast();

const loading = ref<boolean>(false);

const startDate = ref<Date | null>(null);
const endDate = ref<Date | null>(null);
const services = ref<string[] | null>(null);
const username = ref<string | null>(null);

const emit = defineEmits(["showRequestedEvents"]);

const serviceMap = new Map<string, string>([
  [EventServiceTag.Hub, "hub"],
  [EventServiceTag.HubAdapter, "hub_adapter"],
  [EventServiceTag.Kong, "kong"],
  [EventServiceTag.Authentication, "auth"],
]);

function formatDate(date: Date | null): string | null {
  // TODO fix date being different
  if (!date) {
    return null;
  } else {
    return date.toISOString().toLocaleString().slice(0, 16); // cut off unnecessary stuff
  }
}

async function requestEvents() {
  loading.value = true;
  const eventResp: EventLogResponse = (await useNuxtApp()
    .$hubApi("/events", {
      method: "GET",
      query: {
        ...(startDate.value && { start_date: formatDate(startDate.value) }), // the ... checks before adding to query
        ...(endDate.value && { end_date: formatDate(endDate.value) }),
        ...(services.value && { service_names: services.value.join(",") }),
        ...(username.value && { username: username.value }),
      },
    })
    .catch(() => {
      toast.add({
        severity: "error",
        summary: "Event Fetch Failed",
        detail: "Unable to fetch events from database",
        life: 5000,
      });
    })) as EventLogResponse;
  loading.value = false;
  emit("showRequestedEvents", eventResp);
}
</script>

<template>
  <Panel>
    <template #header>
      <div class="flex items-center gap-2">
        <span class="font-bold">Event Viewer</span>
      </div>
    </template>
  </Panel>
  <Card class="custom-filter-card">
    <template #content>
      <div class="custom-filter-startdate-form">
        <FloatLabel class="w-full md:w-80" variant="on">
          <DatePicker
            inputId="startdate_label"
            v-model="startDate"
            showIcon
            showTime
            hourFormat="24"
            showClear
            showButtonBar
            iconDisplay="input"
            class="w-full"
          />
          <label for="startdate_label">Start Date</label>
        </FloatLabel>
      </div>
      <div class="custom-filter-enddate-form">
        <FloatLabel class="w-full md:w-80" variant="on">
          <DatePicker
            inputId="enddate_label"
            v-model="endDate"
            showIcon
            showTime
            hourFormat="24"
            showClear
            showButtonBar
            iconDisplay="input"
            class="w-full"
          />
          <label for="enddate_label">End Date</label>
        </FloatLabel>
      </div>
      <div class="custom-filter-service-multiselect-form">
        <FloatLabel class="" variant="on">
          <MultiSelect
            id="service_label"
            v-model="services"
            display="chip"
            :options="availableServices"
            filter
            class="w-full"
          />
          <label for="service_label">Services</label>
        </FloatLabel>
      </div>
      <div class="custom-filter-username-form">
        <FloatLabel class="" variant="on">
          <InputText id="username" v-model="username" />
          <label for="username">Username</label>
        </FloatLabel>
      </div>
      <div class="custom-filter-submit-btn">
        <Button label="Submit" :loading="loading" @click="requestEvents()" />
      </div>
    </template>
  </Card>
</template>

<style scoped lang="scss"></style>
