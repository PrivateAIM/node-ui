import type { ProjectAnalysisSummary } from "~/utils/summarise-project-analyses";

export const METER_BUCKETS = [
  { key: "executed", label: "Executed" },
  { key: "running", label: "Running" },
  { key: "waiting", label: "Waiting on Hub" },
  { key: "stopped", label: "Stopped" },
  { key: "failed", label: "Failed" },
  { key: "idle", label: "Idle" },
] as const;

/** Returns the non-empty meter buckets of a summary with their counts. */
export function meterSegments(summary: ProjectAnalysisSummary) {
  return METER_BUCKETS.filter((bucket) => summary[bucket.key] > 0).map(
    (bucket) => ({ ...bucket, count: summary[bucket.key] }),
  );
}

/** Returns one "<count> <label>" line per non-empty meter bucket. */
export function meterTooltip(summary: ProjectAnalysisSummary) {
  return meterSegments(summary)
    .map((segment) => `${segment.count} ${segment.label.toLowerCase()}`)
    .join("\n");
}
