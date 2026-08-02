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

const monitoringEnabled = computed(
  () => history.value?.monitoring_enabled ?? true,
);
const intervalSeconds = computed(() => history.value?.interval_seconds ?? null);
const services = computed(() => Object.entries(history.value?.services ?? {}));

/**
 * The adapter caps raw datapoints, but buckets are computed over the whole window, so the
 * only way to exceed the cap here is a probe interval fast enough that one slice would hold
 * more checks than the cap allows. Warn rather than silently render a partial window.
 */
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

async function load({ start, end }: { start: Date; end: Date }) {
  const resolution = resolutionFor(end.getTime() - start.getTime());

  // The adapter floors every bucket to an epoch multiple of `resolution`, so the slots are
  // built on that same grid - and the request must use the floored start, not the raw one.
  // Asking from an unaligned start leaves the first slot permanently empty, because the
  // bucket covering it begins before the requested window and is never returned.
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
      :loading="loading"
      :interval-seconds="intervalSeconds"
      @range-change="load"
    />

    <Message
      v-if="!monitoringEnabled"
      severity="warn"
      class="uptime-page-message"
    >
      {{
        history?.monitoring_detail ??
        "Service health is not being recorded on this node."
      }}
    </Message>

    <template v-else>
      <Message
        v-if="truncationWarning"
        severity="info"
        class="uptime-page-message"
      >
        {{ truncationWarning }}
      </Message>

      <ProgressSpinner v-if="loading && !history" />

      <ServiceUptimeCard
        v-for="[name, summary] in services"
        :key="name"
        :name="name"
        :summary="summary"
        :slots="slots"
        @cell-click="openDrilldown"
      />
    </template>

    <BucketDrilldownDialog
      v-model:visible="drilldownVisible"
      v-model:slot-range="drilldownSlot"
      :service="drilldownService"
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
