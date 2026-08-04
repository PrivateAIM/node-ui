import { describe, expect, it } from "vitest";
import {
  bucketState,
  bucketTooltip,
  trackGapColor,
  uptimePalette,
  SLOW_LATENCY_MS,
  type UptimeBucket,
} from "~/utils/uptime-state";
import { ServiceCheckStatus } from "~/services/Api";

function makeBucket(overrides: Partial<UptimeBucket> = {}): UptimeBucket {
  return {
    start: "2026-07-30T12:00:00Z",
    end: "2026-07-30T12:05:00Z",
    total: 5,
    successful: 5,
    failed: 0,
    max_latency_ms: 40,
    avg_latency_ms: 30,
    worst_status: ServiceCheckStatus.OK,
    message: null,
    ...overrides,
  };
}

describe("bucketState", () => {
  it("pins the slow-latency threshold at 200ms", () => {
    expect(SLOW_LATENCY_MS).toBe(200);
  });

  it("is empty when there is no bucket for the slot", () => {
    expect(bucketState(null)).toBe("empty");
  });

  it("is empty when the bucket recorded no checks", () => {
    expect(bucketState(makeBucket({ total: 0, successful: 0 }))).toBe("empty");
  });

  it("is ok for a fast, fully successful bucket", () => {
    expect(bucketState(makeBucket({ max_latency_ms: 40 }))).toBe("ok");
  });

  it("is ok exactly at the threshold", () => {
    expect(bucketState(makeBucket({ max_latency_ms: SLOW_LATENCY_MS }))).toBe(
      "ok",
    );
  });

  it("is slow one millisecond over the threshold", () => {
    expect(
      bucketState(makeBucket({ max_latency_ms: SLOW_LATENCY_MS + 1 })),
    ).toBe("slow");
  });

  it("is error when any check failed, regardless of latency", () => {
    const bucket = makeBucket({ failed: 1, successful: 4, max_latency_ms: 10 });
    expect(bucketState(bucket)).toBe("error");
  });

  it("prefers error over slow", () => {
    const bucket = makeBucket({
      failed: 1,
      successful: 4,
      max_latency_ms: 5000,
    });
    expect(bucketState(bucket)).toBe("error");
  });

  it("is ok when latency was not recorded but nothing failed", () => {
    expect(bucketState(makeBucket({ max_latency_ms: null }))).toBe("ok");
  });
});

describe("uptimePalette", () => {
  it("returns a colour for every state in both themes", () => {
    for (const isDark of [true, false]) {
      const palette = uptimePalette(isDark);
      for (const state of ["ok", "slow", "error", "empty"] as const) {
        expect(palette[state]).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it("uses different colours in dark mode", () => {
    expect(uptimePalette(true).ok).not.toBe(uptimePalette(false).ok);
  });

  it("uses amber, not orange, for the slow warning colour", () => {
    // Amber is a deliberate spec choice: orange (#ea580c) is the Flame preset's primary
    // brand colour, and a slow cell rendered in it would read as branded rather than as
    // a warning.
    expect(uptimePalette(false).slow).toBe("#f59e0b");
    expect(uptimePalette(true).slow).toBe("#fbbf24");
    expect(uptimePalette(false).slow).not.toBe("#ea580c");
    expect(uptimePalette(true).slow).not.toBe("#ea580c");
  });
});

describe("trackGapColor", () => {
  it("is the card surface, never transparent", () => {
    // A transparent border is still stroked by zrender, so it hides nothing and the
    // cells merge; the gap only reads as a gap if it is painted in the card colour.
    for (const isDark of [true, false]) {
      expect(trackGapColor(isDark)).not.toBe("transparent");
      expect(trackGapColor(isDark)).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("matches --p-content-background in each theme", () => {
    // light: content.background -> {surface.0} -> #ffffff (flame-preset.ts)
    // dark:  content.background -> {surface.900} -> {stone.900} -> #1c1917
    expect(trackGapColor(false)).toBe("#ffffff");
    expect(trackGapColor(true)).toBe("#1c1917");
  });

  it("never collides with a state colour, which would erase a cell", () => {
    for (const isDark of [true, false]) {
      const palette = uptimePalette(isDark);
      expect(Object.values(palette)).not.toContain(trackGapColor(isDark));
    }
  });
});

describe("bucketTooltip", () => {
  const slotStart = new Date("2026-07-30T12:00:00Z");
  const slotEnd = new Date("2026-07-30T12:05:00Z");

  it("reports no data for an empty slot", () => {
    expect(bucketTooltip(null, slotStart, slotEnd)).toContain("No data");
  });

  it("includes the error message for a failed bucket", () => {
    const bucket = makeBucket({
      failed: 1,
      successful: 4,
      message: "Connection refused",
    });
    expect(bucketTooltip(bucket, slotStart, slotEnd)).toContain(
      "Connection refused",
    );
  });

  it("includes the check counts", () => {
    const bucket = makeBucket({ total: 5, successful: 4, failed: 1 });
    const tooltip = bucketTooltip(bucket, slotStart, slotEnd);
    expect(tooltip).toContain("4/5");
  });

  it("includes the worst latency", () => {
    const bucket = makeBucket({ max_latency_ms: 1204 });
    expect(bucketTooltip(bucket, slotStart, slotEnd)).toContain("1204");
  });

  it("does not show a message line when nothing failed, even if a stale message is present", () => {
    const bucket = makeBucket({ failed: 0, message: "stale error" });
    expect(bucketTooltip(bucket, slotStart, slotEnd)).not.toContain(
      "stale error",
    );
  });

  it("escapes markup in the message rather than rendering it", () => {
    const bucket = makeBucket({
      failed: 1,
      successful: 4,
      message: '<img src=x onerror="alert(1)">',
    });
    const tooltip = bucketTooltip(bucket, slotStart, slotEnd);
    expect(tooltip).not.toContain("<img");
    expect(tooltip).toContain("&lt;img");
  });
});
