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

    expect(result.nodes).toHaveLength(57);
    expect(result.truncated).toBe(false);
    expect(hubApi).toHaveBeenCalledTimes(2);
    expect(hubApi.mock.calls[0][1].query.page).toEqual({ offset: 0, limit: 50 });
    expect(hubApi.mock.calls[1][1].query.page).toEqual({ offset: 50, limit: 50 });
  });

  it("stops on an empty page", async () => {
    const hubApi = vi
      .fn()
      .mockResolvedValueOnce(page(50))
      .mockResolvedValueOnce([]);
    const result = await fetchAllAnalysisNodes(hubApi);
    expect(result.nodes).toHaveLength(50);
    expect(result.truncated).toBe(false);
  });

  it("returns what it has when a page request fails, flagged as incomplete", async () => {
    const hubApi = vi
      .fn()
      .mockResolvedValueOnce(page(50))
      .mockRejectedValueOnce(new Error("boom"));
    const result = await fetchAllAnalysisNodes(hubApi);
    expect(result.nodes).toHaveLength(50);
    expect(result.truncated).toBe(false);
    expect(result.incomplete).toBe(true);
  });

  it("caps pagination so a misbehaving API cannot loop forever", async () => {
    const hubApi = vi.fn().mockResolvedValue(page(50));
    const result = await fetchAllAnalysisNodes(hubApi);
    expect(hubApi).toHaveBeenCalledTimes(40);
    expect(result.nodes).toHaveLength(2000);
  });

  it("reports truncation when it stops at the page cap", async () => {
    const hubApi = vi.fn().mockResolvedValue(page(50));
    expect((await fetchAllAnalysisNodes(hubApi)).truncated).toBe(true);
  });

  it("does not report truncation when the last page lands exactly on the cap", async () => {
    // 39 full pages then a short one: every row was read, so nothing is missing
    const hubApi = vi.fn().mockImplementation((_url, opts) => {
      const offset = opts.query.page.offset;
      return Promise.resolve(offset < 39 * 50 ? page(50) : page(10));
    });
    const result = await fetchAllAnalysisNodes(hubApi);
    expect(result.nodes).toHaveLength(39 * 50 + 10);
    expect(result.truncated).toBe(false);
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
    expect(result.projectIds).toEqual(new Set(["proj-1", "proj-2"]));
    expect(result.unavailable).toBe(false);
  });

  it("returns an empty set flagged unavailable when Kong is unreachable", async () => {
    const hubApi = vi.fn().mockRejectedValue(new Error("boom"));
    const result = await fetchDataStoreProjectIds(hubApi);
    expect(result.projectIds).toEqual(new Set());
    expect(result.unavailable).toBe(true);
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

  it("keeps failed, executed and stopped Hub statuses when the pod orchestrator has no entry", () => {
    const result = mergeExecutionStatuses(
      [
        node("a-1", PodStatus.Failed),
        node("a-2", PodStatus.Executed),
        node("a-3", PodStatus.Stopped),
      ],
      {} as never,
    );
    expect(result[0].execution_status).toBe(PodStatus.Failed);
    expect(result[1].execution_status).toBe(PodStatus.Executed);
    expect(result[2].execution_status).toBe(PodStatus.Stopped);
  });

  it("discards other Hub statuses when the pod orchestrator has no entry", () => {
    const result = mergeExecutionStatuses([node("a-1", PodStatus.Started)], {} as never);
    expect(result[0].execution_status).toBeNull();
  });

  it("preserves non-terminal Hub statuses when the pod orchestrator is unreachable", () => {
    // Unlike a reachable orchestrator with no entry, "unreachable" tells us
    // nothing - discarding here would hide genuinely running analyses.
    const result = mergeExecutionStatuses([node("a-1", PodStatus.Executing)], undefined);
    expect(result[0].execution_status).toBe(PodStatus.Executing);
  });

  it("does not mutate the input nodes", () => {
    const input = [node("a-1", PodStatus.Started)];
    mergeExecutionStatuses(input, {} as never);
    expect(input[0].execution_status).toBe(PodStatus.Started);
  });
});
