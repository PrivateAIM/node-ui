<script lang="ts" setup>
import { onUnmounted } from "vue";
import Button from "primevue/button";
import DatePicker from "primevue/datepicker";
import FloatLabel from "primevue/floatlabel";
import SelectButton from "primevue/selectbutton";
import ToggleButton from "primevue/togglebutton";
import Toolbar from "primevue/toolbar";
import { MAX_SPAN_MS, SPAN_PRESETS } from "~/composables/useServiceHealth";

const props = defineProps<{
  loading: boolean;
  intervalSeconds: number | null;
}>();

const emit = defineEmits<{
  rangeChange: [payload: { start: Date; end: Date; live: boolean }];
  refresh: [];
}>();

const DAY_MS = 24 * 60 * 60 * 1000;

const CUSTOM = "Custom";

const DEFAULT_SPAN = "24h";
const FALLBACK_INTERVAL_SECONDS = 60;
const MIN_INTERVAL_SECONDS = 15;

const presetSpans = new Map(
  SPAN_PRESETS.map((preset) => [preset.label, preset.spanMs]),
);
const options = [...presetSpans.keys(), CUSTOM];
const maxSpanDays = MAX_SPAN_MS / DAY_MS;

const selected = ref(DEFAULT_SPAN);
const customStart = ref<Date | null>(null);
const customEnd = ref<Date | null>(null);
const autoRefresh = ref(false);

let timer: ReturnType<typeof setInterval> | undefined;

const isCustom = computed(() => selected.value === CUSTOM);

const customSpanMs = computed(() =>
  customStart.value && customEnd.value
    ? customEnd.value.getTime() - customStart.value.getTime()
    : null,
);

const isInvalidRange = computed(() => {
  const span = customSpanMs.value;

  return (
    span === null || !Number.isFinite(span) || span <= 0 || span > MAX_SPAN_MS
  );
});

const pollMs = computed(
  () =>
    Math.max(
      props.intervalSeconds ?? FALLBACK_INTERVAL_SECONDS,
      MIN_INTERVAL_SECONDS,
    ) * 1000,
);

function spanFor(label: string): number {
  return presetSpans.get(label) ?? presetSpans.get(DEFAULT_SPAN) ?? MAX_SPAN_MS;
}

function seedCustom(label: string) {
  const end = new Date();

  customEnd.value = end;
  customStart.value = new Date(end.getTime() - spanFor(label));
}

function requestRange() {
  if (isCustom.value) {
    if (isInvalidRange.value || !customStart.value || !customEnd.value) return;

    emit("rangeChange", {
      start: customStart.value,
      end: customEnd.value,
      live: false,
    });

    return;
  }

  const end = new Date();

  emit("rangeChange", {
    start: new Date(end.getTime() - spanFor(selected.value)),
    end,
    live: true,
  });
}

function syncTimer() {
  clearInterval(timer);
  timer = undefined;

  if (!autoRefresh.value || isCustom.value) return;

  timer = setInterval(() => {
    requestRange();
    emit("refresh");
  }, pollMs.value);
}

function onRefresh() {
  requestRange();
  emit("refresh");
}

watch(selected, (label, previous) => {
  if (label === CUSTOM) seedCustom(previous);
  else requestRange();

  syncTimer();
});

watch([autoRefresh, pollMs], syncTimer);

onMounted(() => {
  seedCustom(selected.value);
  requestRange();
  syncTimer();
});

onUnmounted(() => clearInterval(timer));

defineExpose({ autoRefresh, customStart, customEnd, isInvalidRange });
</script>

<template>
  <Toolbar class="uptime-toolbar">
    <template #start>
      <h2 class="uptime-toolbar-title">Uptime</h2>
    </template>

    <template #center>
      <div class="uptime-toolbar-center">
        <SelectButton
          v-model="selected"
          :options="options"
          :allow-empty="false"
          aria-label="Time range"
        />

        <div v-if="isCustom" class="uptime-toolbar-custom">
          <FloatLabel variant="on">
            <DatePicker
              input-id="uptime_start"
              v-model="customStart"
              :invalid="isInvalidRange"
              show-icon
              show-time
              hour-format="24"
              icon-display="input"
            />
            <label for="uptime_start">Start</label>
          </FloatLabel>

          <FloatLabel variant="on">
            <DatePicker
              input-id="uptime_end"
              v-model="customEnd"
              :invalid="isInvalidRange"
              show-icon
              show-time
              hour-format="24"
              icon-display="input"
            />
            <label for="uptime_end">End</label>
          </FloatLabel>

          <Button
            data-testid="uptime-apply"
            label="Apply"
            :loading="props.loading"
            @click="requestRange"
          />

          <small
            v-if="isInvalidRange"
            data-testid="uptime-range-error"
            class="uptime-toolbar-error"
            role="alert"
          >
            Choose an end after the start, at most {{ maxSpanDays }} days later.
          </small>
          <small v-else class="uptime-toolbar-hint">
            max span {{ maxSpanDays }} days
          </small>
        </div>
      </div>
    </template>

    <template #end>
      <div class="uptime-toolbar-end">
        <Button
          data-testid="uptime-refresh"
          label="Refresh"
          icon="pi pi-refresh"
          severity="secondary"
          :loading="props.loading"
          @click="onRefresh"
        />
        <ToggleButton
          v-model="autoRefresh"
          data-testid="uptime-auto-refresh"
          :disabled="isCustom"
          on-label="Auto-refresh On"
          off-label="Auto-refresh Off"
          on-icon="pi pi-spin pi-refresh"
          off-icon="pi pi-refresh"
        />
      </div>
    </template>
  </Toolbar>
</template>

<style lang="scss" scoped>
.uptime-toolbar-title {
  margin-block: 0.5em;
  font-weight: 700;
}

.uptime-toolbar-center,
.uptime-toolbar-custom,
.uptime-toolbar-end {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.uptime-toolbar-custom {
  margin-left: 1rem;
}

.uptime-toolbar-hint {
  color: var(--p-text-muted-color);
}

.uptime-toolbar-error {
  color: var(--p-red-500);
}
</style>
