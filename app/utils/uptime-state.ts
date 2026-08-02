import type { ServiceHealthBucket } from "~/services/Api";

export const SLOW_LATENCY_MS = 200;

export type UptimeState = "ok" | "slow" | "error" | "empty";
export type UptimeBucket = ServiceHealthBucket;

export function bucketState(bucket: UptimeBucket | null): UptimeState {
  if (!bucket || bucket.total === 0) return "empty";
  if (bucket.failed > 0) return "error";
  if ((bucket.max_latency_ms ?? 0) > SLOW_LATENCY_MS) return "slow";
  return "ok";
}

export function uptimePalette(isDark: boolean): Record<UptimeState, string> {
  return isDark
    ? { ok: "#4ade80", slow: "#fbbf24", error: "#f87171", empty: "#44403c" }
    : { ok: "#22c55e", slow: "#f59e0b", error: "#ef4444", empty: "#e2e8f0" };
}

export function trackGapColor(isDark: boolean): string {
  return isDark ? "#1c1917" : "#ffffff";
}

export function formatClockTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSlot(start: Date, end: Date): string {
  return `${start.toLocaleDateString()} ${formatClockTime(start)}–${formatClockTime(end)}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function bucketTooltip(
  bucket: UptimeBucket | null,
  slotStart: Date,
  slotEnd: Date,
): string {
  const header = `<strong>${formatSlot(slotStart, slotEnd)}</strong>`;

  if (!bucket || bucket.total === 0) {
    return `${header}<br>No data recorded`;
  }

  const lines = [header, `${bucket.successful}/${bucket.total} checks ok`];

  if (bucket.max_latency_ms != null) {
    lines.push(`worst ${Math.round(bucket.max_latency_ms)} ms`);
  }

  if (bucket.failed > 0 && bucket.message) {
    lines.push(`<em>${escapeHtml(bucket.message)}</em>`);
  }

  return lines.join("<br>");
}
