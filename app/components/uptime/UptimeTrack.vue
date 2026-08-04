<script lang="ts" setup>
import { useDark } from "@vueuse/core";
import type { ComposeOption } from "echarts/core";
import type { HeatmapSeriesOption } from "echarts/charts";
import type {
  GridComponentOption,
  TooltipComponentOption,
  VisualMapComponentOption,
} from "echarts/components";
import {
  bucketState,
  bucketTooltip,
  trackGapColor,
  type UptimeBucket,
  uptimePalette,
  type UptimeState,
} from "~/utils/uptime-state";
import type { UptimeSlot } from "~/composables/useServiceHealth";

type UptimeTrackOption = ComposeOption<
  | GridComponentOption
  | HeatmapSeriesOption
  | TooltipComponentOption
  | VisualMapComponentOption
>;

const props = withDefaults(
  defineProps<{
    slots: UptimeSlot[];
    buckets: (UptimeBucket | null)[];
    disabled?: boolean;
    label?: string;
  }>(),
  { disabled: false, label: undefined },
);

const emit = defineEmits<{
  cellClick: [payload: { slot: UptimeSlot; bucket: UptimeBucket | null }];
}>();

const STATE_ORDER: UptimeState[] = ["ok", "slow", "error", "empty"];

const STATE_LABEL: Record<UptimeState, string> = {
  ok: "ok",
  slow: "slow",
  error: "failing",
  empty: "with no data",
};

const isDark = useDark({
  selector: "html",
  attribute: "class",
  valueDark: "flame-dark",
  valueLight: "flame-light",
  initOnMounted: true,
});

const palette = computed(() => uptimePalette(isDark.value));

function bucketAt(index: number): UptimeBucket | null {
  if (props.disabled) return null;

  return props.buckets[index] ?? null;
}

const points = computed(() =>
  props.slots.map((_slot, index) => [
    index,
    0,
    STATE_ORDER.indexOf(bucketState(bucketAt(index))),
    index,
  ]),
);

const ariaLabel = computed(() => {
  const counts = new Map<UptimeState, number>();

  for (const point of points.value) {
    const state = STATE_ORDER[point[2]!]!;
    counts.set(state, (counts.get(state) ?? 0) + 1);
  }

  const parts = STATE_ORDER.filter((state) => counts.get(state)).map(
    (state) => `${counts.get(state)} ${STATE_LABEL[state]}`,
  );

  const summary = props.label
    ? `Uptime track for ${props.label}, ${props.slots.length} slices`
    : `Uptime track, ${props.slots.length} slices`;

  return parts.length > 0 ? `${summary}: ${parts.join(", ")}` : summary;
});

const option = computed(
  (): UptimeTrackOption => ({
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: {
      type: "category",
      data: props.slots.map((slot) => slot.start.toISOString()),
      show: false,
    },
    yAxis: { type: "category", data: [""], show: false },
    visualMap: {
      type: "piecewise",
      dimension: 2,
      show: false,
      pieces: STATE_ORDER.map((state, value) => ({
        value,
        color: palette.value[state],
      })),
    },
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const index = slotIndexOf(params);
        const slot = index === null ? undefined : props.slots[index];
        if (index === null || !slot) return "";

        return bucketTooltip(bucketAt(index), slot.start, slot.end);
      },
    },
    series: [
      {
        type: "heatmap",
        data: points.value,
        itemStyle: {
          borderRadius: 1,
          borderWidth: 1,
          borderColor: trackGapColor(isDark.value),
        },
        progressive: 0,
      },
    ],
  }),
);

function slotIndexOf(params: unknown): number | null {
  const data = (params as { data?: unknown } | null | undefined)?.data;
  if (!Array.isArray(data)) return null;

  const index = data[3];

  return typeof index === "number" && props.slots[index] ? index : null;
}

function onChartClick(params: unknown) {
  const index = slotIndexOf(params);
  const slot = index === null ? undefined : props.slots[index];
  if (index === null || !slot) return;

  emit("cellClick", { slot, bucket: bucketAt(index) });
}
</script>

<template>
  <VChart
    class="uptime-track"
    role="img"
    :aria-label="ariaLabel"
    :option="option"
    autoresize
    @click="onChartClick"
  />
</template>

<style lang="scss" scoped>
.uptime-track {
  width: 100%;
  height: 34px;
}
</style>
