import { describe, expect, it, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick, type Ref } from "vue";
import UptimeTrack from "~/components/uptime/UptimeTrack.vue";
import { buildSlots } from "~/composables/useServiceHealth";
import {
  trackGapColor,
  uptimePalette,
  type UptimeBucket,
} from "~/utils/uptime-state";
import { ServiceCheckStatus } from "~/services/Api";

// Pin the theme so the palette assertions below are deterministic: `useDark`
// otherwise reads whatever class a previously mounted component left on <html>.
// It has to be a real `ref` rather than a `{ value: false }` literal, or the dark
// palette is unreachable and the theme swap goes untested.
const { theme } = vi.hoisted(() => ({
  theme: {} as { isDark: Ref<boolean> },
}));

vi.mock("@vueuse/core", async (importOriginal) => {
  const { ref } = await import("vue");
  theme.isDark = ref(false);

  return {
    ...(await importOriginal<typeof import("@vueuse/core")>()),
    useDark: () => theme.isDark,
  };
});

/** Restores light mode so a dark-mode test cannot leak into the ones after it. */
async function setDark(value: boolean) {
  theme.isDark.value = value;
  await nextTick();
}

// `<VChart>` is auto-imported by Nuxt's component transform rather than resolved
// by name at runtime, so a `global.stubs` entry never matches it and the real
// canvas chart mounts (and throws in happy-dom). Replacing the module the
// auto-imported wrapper renders is the only interception point that holds.
const { VChartStub } = vi.hoisted(() => ({
  VChartStub: {
    name: "VChart",
    props: ["option"],
    template: "<div class='v-chart-stub' />",
  },
}));

vi.mock("vue-echarts", () => ({ default: VChartStub }));

const slots = buildSlots(
  new Date("2026-07-30T12:00:00Z"),
  new Date("2026-07-30T12:15:00Z"),
  300,
); // 3 slots

function okBucket(start: string): UptimeBucket {
  return {
    start,
    end: start,
    total: 5,
    successful: 5,
    failed: 0,
    max_latency_ms: 20,
    avg_latency_ms: 15,
    worst_status: ServiceCheckStatus.OK,
    message: null,
  };
}

function mountTrack(props: Record<string, unknown> = {}) {
  return mount(UptimeTrack, {
    props: { slots, buckets: [null, null, null], disabled: false, ...props },
  });
}

// The stub types `option` as `any`; asserting on it is the point of these tests.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function optionOf(wrapper: ReturnType<typeof mountTrack>): any {
  return wrapper.findComponent(VChartStub).props("option");
}

describe("UptimeTrack.vue", () => {
  it("renders one data point per slot", () => {
    const option = optionOf(mountTrack());

    expect(option.series[0].data).toHaveLength(3);
  });

  it("encodes the state in the third dimension", () => {
    const option = optionOf(
      mountTrack({ buckets: [okBucket("2026-07-30T12:00:00Z"), null, null] }),
    );

    // [x, y, state, slotIndex] - 0 is ok, 3 is empty
    expect(option.series[0].data[0][2]).toBe(0);
    expect(option.series[0].data[1][2]).toBe(3);
  });

  it("marks a failed bucket as the error state", () => {
    const failed: UptimeBucket = {
      ...okBucket("2026-07-30T12:00:00Z"),
      failed: 1,
      successful: 4,
    };
    const option = optionOf(mountTrack({ buckets: [failed, null, null] }));

    expect(option.series[0].data[0][2]).toBe(2);
  });

  it("marks a slow bucket distinctly from ok and error", () => {
    const slow: UptimeBucket = {
      ...okBucket("2026-07-30T12:00:00Z"),
      max_latency_ms: 900,
    };
    const option = optionOf(mountTrack({ buckets: [slow, null, null] }));

    expect(option.series[0].data[0][2]).toBe(1);
  });

  it("uses a category axis so cells stay evenly sized across gaps", () => {
    const option = optionOf(mountTrack());

    expect(option.xAxis.type).toBe("category");
    expect(option.xAxis.data).toHaveLength(3);
  });

  it("renders the track as a heatmap series", () => {
    // The whole option shape - category axes, visualMap dimension, [x, y, state]
    // points - is meaningless for any other series type.
    expect(optionOf(mountTrack()).series[0].type).toBe("heatmap");
  });

  it("colours the pieces from the theme palette, in state order", () => {
    const option = optionOf(mountTrack());
    const light = uptimePalette(false);

    expect(option.visualMap.dimension).toBe(2);
    expect(option.visualMap.pieces).toEqual([
      { value: 0, color: light.ok },
      { value: 1, color: light.slow },
      { value: 2, color: light.error },
      { value: 3, color: light.empty },
    ]);
  });

  it("swaps to the dark palette when the theme changes", async () => {
    const wrapper = mountTrack();
    expect(optionOf(wrapper).visualMap.pieces[3].color).toBe(
      uptimePalette(false).empty,
    );

    await setDark(true);

    const dark = uptimePalette(true);
    expect(optionOf(wrapper).visualMap.pieces).toEqual([
      { value: 0, color: dark.ok },
      { value: 1, color: dark.slow },
      { value: 2, color: dark.error },
      { value: 3, color: dark.empty },
    ]);

    await setDark(false);
  });

  it("separates the cells with the surface colour of the current theme", async () => {
    // "transparent" would still be stroked by zrender and leave adjacent same-state
    // cells fused into one bar, so the gap has to be painted in the card background.
    const wrapper = mountTrack();
    expect(optionOf(wrapper).series[0].itemStyle.borderColor).toBe(
      trackGapColor(false),
    );

    await setDark(true);
    expect(optionOf(wrapper).series[0].itemStyle.borderColor).toBe(
      trackGapColor(true),
    );

    await setDark(false);
  });

  it("triggers the tooltip per item so the formatter receives one cell", () => {
    // With trigger: "axis" ECharts passes an array and every tooltip renders empty.
    expect(optionOf(mountTrack()).tooltip.trigger).toBe("item");
  });

  it("renders the tooltip from the bucket", () => {
    const failed: UptimeBucket = {
      ...okBucket("2026-07-30T12:00:00Z"),
      failed: 1,
      successful: 4,
      message: "Connection refused",
    };
    const option = optionOf(mountTrack({ buckets: [failed, null, null] }));

    const rendered = option.tooltip.formatter({
      data: option.series[0].data[0],
    });
    expect(rendered).toContain("Connection refused");
  });

  it("renders an empty track when disabled", () => {
    const buckets = [
      okBucket("2026-07-30T12:00:00Z"),
      okBucket("2026-07-30T12:05:00Z"),
      okBucket("2026-07-30T12:10:00Z"),
    ];
    const option = optionOf(mountTrack({ disabled: true, buckets }));

    expect(
      option.series[0].data.every((point: number[]) => point[2] === 3),
    ).toBe(true);
    expect(
      option.tooltip.formatter({ data: option.series[0].data[0] }),
    ).toContain("No data recorded");
  });

  it("emits cellClick with the slot and bucket that was clicked", async () => {
    const bucket = okBucket("2026-07-30T12:05:00Z");
    const wrapper = mountTrack({ buckets: [null, bucket, null] });

    const option = optionOf(wrapper);
    await wrapper
      .findComponent(VChartStub)
      .vm.$emit("click", { data: option.series[0].data[1] });

    expect(wrapper.emitted("cellClick")).toHaveLength(1);
    expect(wrapper.emitted("cellClick")![0]).toEqual([
      { slot: slots[1], bucket },
    ]);
  });

  it("emits a null bucket when the service is disabled", async () => {
    const bucket = okBucket("2026-07-30T12:00:00Z");
    const wrapper = mountTrack({
      disabled: true,
      buckets: [bucket, null, null],
    });

    const option = optionOf(wrapper);
    await wrapper
      .findComponent(VChartStub)
      .vm.$emit("click", { data: option.series[0].data[0] });

    expect(wrapper.emitted("cellClick")![0]).toEqual([
      { slot: slots[0], bucket: null },
    ]);
  });

  it("ignores a click that carries no data point", async () => {
    const wrapper = mountTrack();

    // ECharts fires `click` for non-series targets too, where `data` is absent.
    await wrapper
      .findComponent(VChartStub)
      .vm.$emit("click", { data: undefined });

    expect(wrapper.emitted("cellClick")).toBeUndefined();
  });

  it("summarises the track for assistive technology", () => {
    const failed: UptimeBucket = {
      ...okBucket("2026-07-30T12:00:00Z"),
      failed: 1,
      successful: 4,
    };
    const wrapper = mountTrack({
      buckets: [failed, okBucket("2026-07-30T12:05:00Z"), null],
    });

    expect(wrapper.attributes("role")).toBe("img");
    expect(wrapper.attributes("aria-label")).toBe(
      "Uptime track, 3 slices: 1 ok, 1 failing, 1 with no data",
    );
  });

  it("names the service in the aria-label when a label is given", () => {
    // One card per service means ten otherwise identical "Uptime track" graphics.
    const wrapper = mountTrack({
      label: "hub-adapter",
      buckets: [okBucket("2026-07-30T12:00:00Z"), null, null],
    });

    expect(wrapper.attributes("aria-label")).toBe(
      "Uptime track for hub-adapter, 3 slices: 1 ok, 2 with no data",
    );
  });
});
