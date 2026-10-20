import { describe, expect, it } from "vitest";
import {
  METER_BUCKETS,
  meterSegments,
  meterTooltip,
} from "~/utils/project-status-meter";
import { emptyProjectAnalysisSummary } from "~/utils/summarise-project-analyses";

const summary = {
  ...emptyProjectAnalysisSummary(true),
  total: 6,
  executed: 4,
  failed: 2,
};

describe("project status meter", () => {
  it("lists the buckets in display order", () => {
    expect(METER_BUCKETS.map((bucket) => bucket.key)).toEqual([
      "executed",
      "running",
      "waiting",
      "stopped",
      "failed",
      "idle",
    ]);
  });

  it("keeps only the non-empty buckets with their counts", () => {
    expect(meterSegments(summary)).toEqual([
      { key: "executed", label: "Executed", count: 4 },
      { key: "failed", label: "Failed", count: 2 },
    ]);
  });

  it("builds one tooltip line per non-empty bucket", () => {
    expect(meterTooltip(summary)).toBe("4 executed\n2 failed");
    expect(meterTooltip(emptyProjectAnalysisSummary(false))).toBe("");
  });
});
