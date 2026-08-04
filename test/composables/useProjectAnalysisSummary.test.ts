import { describe, expect, it, vi } from "vitest";
import {
  fetchAllAnalysisNodes,
  fetchDataStoreProjectIds,
  fetchExecutionStatuses,
  mergeExecutionStatuses,
} from "~/composables/useProjectAnalysisSummary";
import { PodStatus, type AnalysisNode } from "~/services/Api";

function page(size: number, idPrefix = "a"): AnalysisNode[] {
  return Array.from({ length: size }, (_, i) => ({
    analysis_id: `${idPrefix}-${i}`,
  })) as unknown as AnalysisNode[];
}

describe("fetchAllAnalysisNodes", () => {
  it("stops after a short page", async () => {
    const hubApi = vi
      .fn()
      .mockResolvedValueOnce(page(50, "p1"))
      .mockResolvedValueOnce(page(7, "p2"));

    const result = await fetchAllAnalysisNodes(hubApi);

    expect(result).toHaveLength(57);
    expect(hubApi).toHaveBeenCalledTimes(2);
    expect(hubApi.mock.calls[0][1].query.page).toEqual({ offset: 0, limit: 50 });
    expect(hubApi.mock.calls[1][1].query.page).toEqual({ offset: 50, limit: 50 });
  });

  it("stops on an empty page", async () => {
    const hubApi = vi
      .fn()
      .mockResolvedValueOnce(page(50))
      .mockResolvedValueOnce([]);
    expect(await fetchAllAnalysisNodes(hubApi)).toHaveLength(50);
  });

  it("returns what it has when a page request fails", async () => {
    const hubApi = vi
      .fn()
      .mockResolvedValueOnce(page(50))
      .mockRejectedValueOnce(new Error("boom"));
    expect(await fetchAllAnalysisNodes(hubApi)).toHaveLength(50);
  });

  it("caps pagination so a misbehaving API cannot loop forever", async () => {
    const hubApi = vi.fn().mockResolvedValue(page(50));
    const result = await fetchAllAnalysisNodes(hubApi);
    expect(hubApi).toHaveBeenCalledTimes(40);
    expect(result).toHaveLength(2000);
  });
});

describe("fetchDataStoreProjectIds", () => {
  it("collects project ids from route tags", async () => {
    const hubApi = vi.fn().mockResolvedValue({
      data: [
        { tags: ["project:proj-1", "type:fhir"] },
        { tags: ["project:proj-2"] },
        { tags: ["health"] },
        { tags: null },
      ],
    });
    const result = await fetchDataStoreProjectIds(hubApi);
    expect(result).toEqual(new Set(["proj-1", "proj-2"]));
  });

  it("returns an empty set when Kong is unreachable", async () => {
    const hubApi = vi.fn().mockRejectedValue(new Error("boom"));
    expect(await fetchDataStoreProjectIds(hubApi)).toEqual(new Set());
  });
});

describe("fetchExecutionStatuses", () => {
  it("returns undefined when the pod orchestrator is unreachable", async () => {
    const hubApi = vi.fn().mockRejectedValue(new Error("boom"));
    expect(await fetchExecutionStatuses(hubApi)).toBeUndefined();
  });
});

describe("mergeExecutionStatuses", () => {
  const node = (analysisId: string, executionStatus: PodStatus | null) =>
    ({ analysis_id: analysisId, execution_status: executionStatus }) as unknown as AnalysisNode;

  it("prefers the pod orchestrator's status", () => {
    const result = mergeExecutionStatuses(
      [node("a-1", PodStatus.Executed)],
      { "a-1": { status: PodStatus.Executing, progress: 40 } } as never,
    );
    expect(result[0].execution_status).toBe(PodStatus.Executing);
  });

  it("keeps failed and executed Hub statuses when the pod orchestrator has no entry", () => {
    const result = mergeExecutionStatuses(
      [node("a-1", PodStatus.Failed), node("a-2", PodStatus.Executed)],
      {} as never,
    );
    expect(result[0].execution_status).toBe(PodStatus.Failed);
    expect(result[1].execution_status).toBe(PodStatus.Executed);
  });

  it("discards other Hub statuses when the pod orchestrator has no entry", () => {
    const result = mergeExecutionStatuses([node("a-1", PodStatus.Started)], {} as never);
    expect(result[0].execution_status).toBeNull();
  });

  it("discards non-terminal Hub statuses when the pod orchestrator is unreachable", () => {
    const result = mergeExecutionStatuses([node("a-1", PodStatus.Executing)], undefined);
    expect(result[0].execution_status).toBeNull();
  });

  it("does not mutate the input nodes", () => {
    const input = [node("a-1", PodStatus.Started)];
    mergeExecutionStatuses(input, {} as never);
    expect(input[0].execution_status).toBe(PodStatus.Started);
  });
});
