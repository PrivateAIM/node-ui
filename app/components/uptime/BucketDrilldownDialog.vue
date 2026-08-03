<script lang="ts" setup>
import Button from "primevue/button";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import Dialog from "primevue/dialog";
import Tag from "primevue/tag";
import { getServiceHealthHistory } from "~/composables/useAPIFetch";
import type { UptimeSlot } from "~/composables/useServiceHealth";
import { formatClockTime, SLOW_LATENCY_MS } from "~/utils/uptime-state";
import { ServiceCheckStatus, type ServiceHealthPoint } from "~/services/Api";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    serviceTitle: string | null;
    service: string | null;
    slotRange: UptimeSlot | null;
    slots?: UptimeSlot[];
  }>(),
  { slots: () => [] },
);

const emit = defineEmits<{
  "update:visible": [value: boolean];
  "update:slotRange": [value: UptimeSlot];
}>();

const checks = ref<ServiceHealthPoint[]>([]);
const loading = ref(false);

let latestRequest = 0;

async function loadChecks() {
  const service = props.service;
  const range = props.slotRange;

  if (!props.visible || !service || !range) {
    checks.value = [];
    return;
  }

  const request = ++latestRequest;
  loading.value = true;

  try {
    const { data } = await getServiceHealthHistory({
      start_date: range.start.toISOString(),
      end_date: range.end.toISOString(),
      service: [service],
      include_checks: true,
    });

    if (request !== latestRequest) return;

    checks.value = data.value?.services?.[service]?.checks ?? [];
  } finally {
    if (request === latestRequest) loading.value = false;
  }
}

const currentIndex = computed(() => {
  const range = props.slotRange;
  if (!range) return -1;

  return props.slots.findIndex(
    (slot) => slot.start.getTime() === range.start.getTime(),
  );
});

const hasPrevious = computed(() => currentIndex.value > 0);
const hasNext = computed(
  () => currentIndex.value >= 0 && currentIndex.value < props.slots.length - 1,
);

const headerLabel = computed(() =>
  props.service ? `${props.serviceTitle} Health Checks` : "Health Checks",
);

const windowLabel = computed(() => {
  const range = props.slotRange;
  if (!range) return "";

  const window = `${formatClockTime(range.start)} - ${formatClockTime(range.end)}`;

  return currentIndex.value < 0
    ? window
    : `${window} · slice ${currentIndex.value + 1} of ${props.slots.length}`;
});

function step(offset: number) {
  const target = props.slots[currentIndex.value + offset];
  if (currentIndex.value < 0 || !target) return;

  emit("update:slotRange", target);
}

function isSlow(latency: number | null | undefined): boolean {
  return latency != null && latency > SLOW_LATENCY_MS;
}

function formatTime(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

watch(() => [props.visible, props.service, props.slotRange], loadChecks, {
  immediate: true,
});
</script>

<template>
  <Dialog
    :header="headerLabel"
    :style="{ width: '48rem' }"
    :visible="visible"
    dismissable-mask
    modal
    @update:visible="emit('update:visible', $event)"
  >
    <div class="bucket-drilldown-nav">
      <Button
        :disabled="!hasPrevious"
        data-testid="uptime-drilldown-prev"
        icon="pi pi-chevron-left"
        label="Previous slice"
        severity="secondary"
        size="small"
        text
        @click="step(-1)"
      />

      <span
        aria-live="polite"
        class="bucket-drilldown-window"
        data-testid="uptime-drilldown-window"
      >
        {{ windowLabel }}
      </span>

      <Button
        :disabled="!hasNext"
        data-testid="uptime-drilldown-next"
        icon="pi pi-chevron-right"
        icon-pos="right"
        label="Next slice"
        severity="secondary"
        size="small"
        text
        @click="step(1)"
      />
    </div>

    <DataTable :loading="loading" :value="checks" size="small">
      <Column field="checked_at" header="Checked at">
        <template #body="{ data }">{{ formatTime(data.checked_at) }}</template>
      </Column>
      <Column field="status" header="Status">
        <template #body="{ data }">
          <Tag
            :severity="
              data.status === ServiceCheckStatus.OK ? 'success' : 'danger'
            "
            :value="data.status"
          />
        </template>
      </Column>
      <Column field="status_code" header="Code" />
      <Column field="latency_ms" header="Latency (ms)">
        <template #body="{ data }">
          <span :class="{ 'bucket-drilldown-slow': isSlow(data.latency_ms) }">
            {{ data.latency_ms ?? "-" }}
          </span>
        </template>
      </Column>
      <Column field="message" header="Message" />

      <template #empty>No checks recorded in this window.</template>
    </DataTable>
  </Dialog>
</template>

<style lang="scss" scoped>
.bucket-drilldown-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.bucket-drilldown-window {
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.bucket-drilldown-slow {
  color: var(--p-amber-700);
  font-weight: 700;
}

:global(html.flame-dark .bucket-drilldown-slow) {
  color: var(--p-amber-400);
}
</style>
