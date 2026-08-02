import { describe, expect, it } from "vitest";
import {
  alignBuckets,
  buildSlots,
  floorToGrid,
  MAX_SPAN_MS,
  resolutionFor,
  SPAN_PRESETS,
  type UptimeSlot,
} from "~/composables/useServiceHealth";
import type { UptimeBucket } from "~/utils/uptime-state";
import { ServiceCheckStatus } from "~/services/Api";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

describe("resolutionFor", () => {
  it.each([
    [1 * HOUR, 30],
    [6 * HOUR, 180],
    [24 * HOUR, 720],
    [7 * DAY, 3600],
  ])("maps a %ims span to %is slices", (span, expected) => {
    expect(resolutionFor(span)).toBe(expected);
  });

  it("keeps every preset under 200 cells", () => {
    for (const preset of SPAN_PRESETS) {
      expect(
        preset.spanMs / 1000 / resolutionFor(preset.spanMs),
      ).toBeLessThanOrEqual(200);
    }
  });

  it("uses the finest slice for a very short span", () => {
    expect(resolutionFor(5 * 60 * 1000)).toBe(30);
  });
});

describe("floorToGrid", () => {
  it("floors an unaligned instant back to an epoch multiple", () => {
    expect(floorToGrid(new Date("2026-07-30T12:37:41Z"), 3600)).toEqual(
      new Date("2026-07-30T12:00:00Z"),
    );
  });

  it("floors to the finer grid at a smaller resolution", () => {
    expect(floorToGrid(new Date("2026-07-30T12:37:41Z"), 300)).toEqual(
      new Date("2026-07-30T12:35:00Z"),
    );
  });

  it("leaves an instant already on the grid untouched", () => {
    const aligned = new Date("2026-07-30T12:00:00Z");
    expect(floorToGrid(aligned, 3600)).toEqual(aligned);
  });
});

describe("buildSlots", () => {
  it("covers the whole range with contiguous slots", () => {
    const start = new Date("2026-07-30T12:00:00Z");
    const end = new Date("2026-07-30T13:00:00Z");

    const slots = buildSlots(start, end, 300);

    expect(slots).toHaveLength(12);
    expect(slots[0]!.start).toEqual(start);
    expect(slots[11]!.end).toEqual(end);
    for (let i = 1; i < slots.length; i++) {
      expect(slots[i]!.start).toEqual(slots[i - 1]!.end);
    }
  });

  it("returns no slots for an inverted range", () => {
    const start = new Date("2026-07-30T13:00:00Z");
    const end = new Date("2026-07-30T12:00:00Z");
    expect(buildSlots(start, end, 300)).toHaveLength(0);
  });

  it("snaps an unaligned start onto the adapter's epoch grid", () => {
    const slots = buildSlots(
      new Date("2026-07-30T12:37:41Z"),
      new Date("2026-07-30T14:00:00Z"),
      3600,
    );

    expect(slots).toHaveLength(2);
    expect(slots[0]!.start).toEqual(new Date("2026-07-30T12:00:00Z"));
    expect(slots[1]!.start).toEqual(new Date("2026-07-30T13:00:00Z"));
  });

  it("leaves a start already on the grid exactly where it was", () => {
    const start = new Date("2026-07-30T12:00:00Z");
    const slots = buildSlots(start, new Date("2026-07-30T13:00:00Z"), 3600);

    expect(slots).toHaveLength(1);
    expect(slots[0]!.start).toEqual(start);
  });

  it("truncates the final slot when the range is not a whole multiple", () => {
    const slots: UptimeSlot[] = buildSlots(
      new Date("2026-07-30T12:00:00Z"),
      new Date("2026-07-30T12:07:00Z"),
      300,
    );

    expect(slots).toHaveLength(2);
    expect(slots[1]!.start).toEqual(new Date("2026-07-30T12:05:00Z"));
    expect(slots[1]!.end).toEqual(new Date("2026-07-30T12:07:00Z"));
  });

  it.each([[0], [-300]])(
    "returns no slots for a %is resolution",
    (resolution) => {
      const slots = buildSlots(
        new Date("2026-07-30T12:00:00Z"),
        new Date("2026-07-30T13:00:00Z"),
        resolution,
      );

      expect(slots).toHaveLength(0);
    },
  );
});

describe("alignBuckets", () => {
  const start = new Date("2026-07-30T12:00:00Z");
  const end = new Date("2026-07-30T12:15:00Z");
  const slots = buildSlots(start, end, 300); // 3 slots

  function bucketAt(iso: string): UptimeBucket {
    return {
      start: iso,
      end: iso,
      total: 5,
      successful: 5,
      failed: 0,
      max_latency_ms: 20,
      avg_latency_ms: 15,
      worst_status: ServiceCheckStatus.OK,
      message: null,
    };
  }

  it("returns one entry per slot", () => {
    expect(alignBuckets(slots, [])).toHaveLength(3);
  });

  it("fills slots the adapter omitted with null", () => {
    const aligned = alignBuckets(slots, [bucketAt("2026-07-30T12:00:00Z")]);

    expect(aligned[0]).not.toBeNull();
    expect(aligned[1]).toBeNull();
    expect(aligned[2]).toBeNull();
  });

  it("places each bucket in the slot containing its start", () => {
    const aligned = alignBuckets(slots, [bucketAt("2026-07-30T12:10:00Z")]);

    expect(aligned[0]).toBeNull();
    expect(aligned[1]).toBeNull();
    expect(aligned[2]!.start).toBe("2026-07-30T12:10:00Z");
  });

  it("ignores buckets outside the slot range", () => {
    const aligned = alignBuckets(slots, [bucketAt("2026-07-30T20:00:00Z")]);
    expect(aligned.every((entry) => entry === null)).toBe(true);
  });

  it("discards buckets whose start will not parse", () => {
    const aligned = alignBuckets(slots, [
      bucketAt("not-a-date"),
      bucketAt("2026-07-30T12:00:00Z"),
      bucketAt("2026-07-30T12:10:00Z"),
    ]);

    expect(aligned[0]!.start).toBe("2026-07-30T12:00:00Z");
    expect(aligned[1]).toBeNull();
    expect(aligned[2]!.start).toBe("2026-07-30T12:10:00Z");
  });

  it("aligns buckets the adapter did not return in order", () => {
    const aligned = alignBuckets(slots, [
      bucketAt("2026-07-30T12:10:00Z"),
      bucketAt("2026-07-30T12:00:00Z"),
    ]);

    expect(aligned[0]!.start).toBe("2026-07-30T12:00:00Z");
    expect(aligned[1]).toBeNull();
    expect(aligned[2]!.start).toBe("2026-07-30T12:10:00Z");
  });
});

describe("MAX_SPAN_MS", () => {
  it("is seven days", () => {
    expect(MAX_SPAN_MS).toBe(7 * DAY);
  });

  it("bounds every preset", () => {
    for (const preset of SPAN_PRESETS) {
      expect(preset.spanMs).toBeLessThanOrEqual(MAX_SPAN_MS);
    }
  });
});
