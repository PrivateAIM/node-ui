import { describe, expect, it, vi } from "vitest";
import { countAnalysisContainers } from "~/utils/count-analyses";
import { PodStatus } from "~/services/Api";
import type { ModifiedAnalysisNode } from "~/services/modifiedApiInterfaces";

function makeNode(
  status: PodStatus | null | undefined,
): ModifiedAnalysisNode {
  return { executionStatus: status } as ModifiedAnalysisNode;
}

describe("countAnalysisContainers", () => {
  it("returns all-zero counts for an empty array", () => {
    const result = countAnalysisContainers([]);
    expect(result).toEqual({
      started: 0,
      executing: 0,
      failed: 0,
      executed: 0,
      stopped: 0,
    });
  });

  it("counts Started and Starting as started", () => {
    const result = countAnalysisContainers([
      makeNode(PodStatus.Started),
      makeNode(PodStatus.Starting),
    ]);
    expect(result.started).toBe(2);
  });

  it("counts Executing as executing", () => {
    const result = countAnalysisContainers([
      makeNode(PodStatus.Executing),
    ]);
    expect(result.executing).toBe(1);
  });

  it("counts Stopping and Stopped as stopped", () => {
    const result = countAnalysisContainers([
      makeNode(PodStatus.Stopping),
      makeNode(PodStatus.Stopped),
    ]);
    expect(result.stopped).toBe(2);
  });

  it("counts Failed as failed", () => {
    const result = countAnalysisContainers([makeNode(PodStatus.Failed)]);
    expect(result.failed).toBe(1);
  });

  it("counts Executed as executed", () => {
    const result = countAnalysisContainers([
      makeNode(PodStatus.Executed),
    ]);
    expect(result.executed).toBe(1);
  });

  it("skips nodes with null or undefined executionStatus", () => {
    const result = countAnalysisContainers([
      makeNode(null),
      makeNode(undefined),
    ]);
    expect(result).toEqual({
      started: 0,
      executing: 0,
      failed: 0,
      executed: 0,
      stopped: 0,
    });
  });

  it("logs and ignores an unrecognised executionStatus", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    const result = countAnalysisContainers([
      makeNode("stuck" as PodStatus),
    ]);
    expect(spy).toHaveBeenCalledWith("stuck not an acceptable option");
    expect(result).toEqual({
      started: 0,
      executing: 0,
      failed: 0,
      executed: 0,
      stopped: 0,
    });
    spy.mockRestore();
  });

  it("tallies a mixed array correctly", () => {
    const result = countAnalysisContainers([
      makeNode(PodStatus.Started),
      makeNode(PodStatus.Executing),
      makeNode(PodStatus.Executing),
      makeNode(PodStatus.Failed),
      makeNode(PodStatus.Executed),
      makeNode(PodStatus.Stopped),
    ]);
    expect(result).toEqual({
      started: 1,
      executing: 2,
      failed: 1,
      executed: 1,
      stopped: 1,
    });
  });
});
