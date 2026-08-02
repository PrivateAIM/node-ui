<script lang="ts" setup>
import Card from "primevue/card";
import Tag from "primevue/tag";
import UptimeTrack from "~/components/uptime/UptimeTrack.vue";
import { alignBuckets, type UptimeSlot } from "~/composables/useServiceHealth";
import type { UptimeBucket } from "~/utils/uptime-state";
import type { ServiceHealthSummary } from "~/services/Api";

const props = defineProps<{
  name: string;
  summary: ServiceHealthSummary;
  slots: UptimeSlot[];
}>();

const emit = defineEmits<{
  cellClick: [
    payload: { service: string; slot: UptimeSlot; bucket: UptimeBucket | null },
  ];
}>();

const isDisabled = computed(() => !props.summary.configured);

const buckets = computed(() =>
  alignBuckets(props.slots, props.summary.buckets ?? []),
);

const uptimeLabel = computed(() =>
  props.summary.uptime_percentage === null ||
  props.summary.uptime_percentage === undefined
    ? "-"
    : `${props.summary.uptime_percentage.toFixed(2)}%`,
);

const lastCheckedLabel = computed(() => {
  if (!props.summary.last_checked_at) return "-";

  const checked = new Date(props.summary.last_checked_at);

  return checked.toDateString() === new Date().toDateString()
    ? checked.toLocaleTimeString()
    : checked.toLocaleString();
});

const rangeStart = computed(() => props.slots[0]?.start.toLocaleString() ?? "");
const rangeEnd = computed(
  () => props.slots[props.slots.length - 1]?.end.toLocaleString() ?? "",
);
</script>

<template>
  <Card class="service-uptime-card">
    <template #title>
      <div class="service-uptime-card-header">
        <h3 class="service-uptime-card-name">{{ name }}</h3>
        <Tag v-if="isDisabled" severity="secondary" value="disabled" />
        <span v-else class="service-uptime-card-stats">
          <span class="service-uptime-card-uptime">{{ uptimeLabel }}</span>
          <span class="service-uptime-card-last-checked"
            >Last checked {{ lastCheckedLabel }}</span
          >
        </span>
      </div>
    </template>

    <template #content>
      <UptimeTrack
        :slots="slots"
        :buckets="buckets"
        :disabled="isDisabled"
        :label="name"
        @cell-click="emit('cellClick', { ...$event, service: name })"
      />

      <template v-if="isDisabled">
        <div v-if="summary.detail" class="service-uptime-card-detail">
          {{ summary.detail }}
        </div>
      </template>
      <div v-else class="service-uptime-card-axis">
        <span>{{ rangeStart }}</span>
        <span>{{ rangeEnd }}</span>
      </div>
    </template>
  </Card>
</template>

<style lang="scss" scoped>
.service-uptime-card {
  margin-bottom: 1rem;
}

.service-uptime-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.service-uptime-card-name {
  margin: 0;
  font-size: inherit;
  font-weight: 700;
  font-family: monospace;
}

.service-uptime-card-stats {
  margin-left: auto;
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--p-text-muted-color);
}

.service-uptime-card-detail,
.service-uptime-card-axis {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
}

.service-uptime-card-axis {
  display: flex;
  justify-content: space-between;
}
</style>
