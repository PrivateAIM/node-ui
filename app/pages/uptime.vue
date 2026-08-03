<script lang="ts" setup>
import Message from "primevue/message";
import ProgressSpinner from "primevue/progressspinner";
import UptimeToolbar from "~/components/uptime/UptimeToolbar.vue";
import ServiceUptimeCard from "~/components/uptime/ServiceUptimeCard.vue";
import BucketDrilldownDialog from "~/components/uptime/BucketDrilldownDialog.vue";
import { getServiceHealthHistory } from "~/composables/useAPIFetch";
import {
  buildSlots,
  floorToGrid,
  resolutionFor,
  type UptimeSlot,
} from "~/composables/useServiceHealth";
import type { ServiceHealthHistory } from "~/services/Api";
import type { UptimeBucket } from "~/utils/uptime-state";

const MAX_EXPECTED_CHECKS = 10000;

const history = ref<ServiceHealthHistory | null>(null);
const slots = ref<UptimeSlot[]>([]);
const loading = ref(false);

const drilldownVisible = ref(false);
const drilldownService = ref<string | null>(null);
const drilldownSlot = ref<UptimeSlot | null>(null);
const drilldownTitle = computed(() =>
  drilldownService.value ? mapServiceName(drilldownService.value) : null,
);

const monitoringEnabled = computed(
  () => history.value?.monitoring_enabled ?? true,
);
const intervalSeconds = computed(() => history.value?.interval_seconds ?? null);
const services = computed(() => Object.entries(history.value?.services ?? {}));

const truncationWarning = computed(() => {
  const interval = history.value?.interval_seconds;
  const first = slots.value[0];
  const last = slots.value[slots.value.length - 1];
  if (!interval || !first || !last) return null;

  const spanSeconds = (last.end.getTime() - first.start.getTime()) / 1000;
  const expected = spanSeconds / interval;

  return expected > MAX_EXPECTED_CHECKS
    ? `This node probes every ${interval}s, so this window holds about ${Math.round(expected)} checks per service.`
    : null;
});

const svcNameMap = new Map<string, string>([
  ["fhir", "FHIR Server"],
  ["hub_core", "Hub - Core Service"],
  ["hub_auth", "Hub - Auth Service"],
  ["idp", "Internal Keycloak"],
  ["kong", "Kong Gateway API"],
  ["message_broker", "Message Broker Service"],
  ["po", "Pod Orchestrator"],
  ["s3", "S3 Server"],
  ["storage", "Storage Service"],
  ["victoria_logs", "Victoria Logs"],
]);

function mapServiceName(svcKey: string) {
  return svcNameMap.get(svcKey) ?? svcKey;
}

async function load({ start, end }: { start: Date; end: Date }) {
  const resolution = resolutionFor(end.getTime() - start.getTime());

  const gridStart = floorToGrid(start, resolution);
  slots.value = buildSlots(gridStart, end, resolution);
  loading.value = true;

  try {
    const { data } = await getServiceHealthHistory({
      start_date: gridStart.toISOString(),
      end_date: end.toISOString(),
      resolution,
    });
    history.value = data.value ?? null;
  } finally {
    loading.value = false;
  }
}

function openDrilldown(payload: {
  service: string;
  slot: UptimeSlot;
  bucket: UptimeBucket | null;
}) {
  drilldownService.value = payload.service;
  drilldownSlot.value = payload.slot;
  drilldownVisible.value = true;
}
</script>

<template>
  <div class="uptime-page">
    <UptimeToolbar
      :interval-seconds="intervalSeconds"
      :loading="loading"
      @range-change="load"
    />

    <Message
      v-if="!monitoringEnabled"
      class="uptime-page-message"
      severity="warn"
    >
      {{
        history?.monitoring_detail ??
        "Service health is not being recorded on this node."
      }}
    </Message>

    <template v-else>
      <Message
        v-if="truncationWarning"
        class="uptime-page-message"
        severity="info"
      >
        {{ truncationWarning }}
      </Message>

      <ProgressSpinner v-if="loading && !history" />

      <ServiceUptimeCard
        v-for="[name, summary] in services"
        :key="name"
        :name="mapServiceName(name) ?? name"
        :slots="slots"
        :summary="summary"
        @cell-click="(payload) => openDrilldown({ ...payload, service: name })"
      />
    </template>

    <BucketDrilldownDialog
      v-model:slot-range="drilldownSlot"
      v-model:visible="drilldownVisible"
      :service="drilldownService"
      :serviceTitle="drilldownTitle"
      :slots="slots"
    />
  </div>
</template>

<style lang="scss" scoped>
.uptime-page {
  padding: 1rem;
}

.uptime-page-message {
  margin: 1rem 0;
}
</style>
