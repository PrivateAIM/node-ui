import { describe, expect, it } from "vitest";
import {
  emptyProjectAnalysisSummary,
  summariseProjectAnalyses,
} from "~/utils/summarise-project-analyses";
import { type AnalysisNode, PodStatus } from "~/services/Api";

const PROJECT_A = "aaaaaaaa-0000-0000-0000-000000000000";
const PROJECT_B = "bbbbbbbb-0000-0000-0000-000000000000";

function makeNode(overrides: {
  projectId?: string;
  executionStatus?: PodStatus | null;
  approvalStatus?: "approved" | "rejected" | null;
  buildStatus?: string | null;
  distributionStatus?: string | null;
}): AnalysisNode {
  return {
    approval_status:
      overrides.approvalStatus !== undefined
        ? overrides.approvalStatus
        : "approved",
    execution_status:
      overrides.executionStatus !== undefined
        ? overrides.executionStatus
        : null,
    analysis: {
      project_id:
        overrides.projectId !== undefined ? overrides.projectId : PROJECT_A,
      build_status:
        overrides.buildStatus !== undefined
          ? overrides.buildStatus
          : "executed",
      distribution_status:
        overrides.distributionStatus !== undefined
          ? overrides.distributionStatus
          : "executed",
    },
  } as unknown as AnalysisNode;
}

describe("emptyProjectAnalysisSummary", () => {
  it("returns all-zero counts and carries hasDataStore through", () => {
    expect(emptyProjectAnalysisSummary(true)).toEqual({
      total: 0,
      executed: 0,
      running: 0,
      failed: 0,
      stopped: 0,
      waiting: 0,
      idle: 0,
      hasDataStore: true,
    });
    expect(emptyProjectAnalysisSummary(false).hasDataStore).toBe(false);
  });
});

describe("summariseProjectAnalyses", () => {
  it("returns an empty map for no analysis nodes", () => {
    expect(summariseProjectAnalyses([], new Set()).size).toBe(0);
  });

  it("groups counts by project id", () => {
    const result = summariseProjectAnalyses(
      [
        makeNode({ projectId: PROJECT_A, executionStatus: PodStatus.Executed }),
        makeNode({ projectId: PROJECT_A, executionStatus: PodStatus.Failed }),
        makeNode({ projectId: PROJECT_B, executionStatus: PodStatus.Executed }),
      ],
      new Set(),
    );
    expect(result.get(PROJECT_A)!.total).toBe(2);
    expect(result.get(PROJECT_A)!.failed).toBe(1);
    expect(result.get(PROJECT_B)!.total).toBe(1);
  });

  it("counts failed as failed", () => {
    const result = summariseProjectAnalyses(
      [makeNode({ executionStatus: PodStatus.Failed })],
      new Set(),
    );
    expect(result.get(PROJECT_A)!.failed).toBe(1);
  });

  it("counts starting, started and executing as running", () => {
    const result = summariseProjectAnalyses(
      [
        makeNode({ executionStatus: PodStatus.Starting }),
        makeNode({ executionStatus: PodStatus.Started }),
        makeNode({ executionStatus: PodStatus.Executing }),
      ],
      new Set(),
    );
    expect(result.get(PROJECT_A)!.running).toBe(3);
  });

  it("counts stopping and stopped as stopped", () => {
    const result = summariseProjectAnalyses(
      [
        makeNode({ executionStatus: PodStatus.Stopping }),
        makeNode({ executionStatus: PodStatus.Stopped }),
      ],
      new Set(),
    );
    expect(result.get(PROJECT_A)!.stopped).toBe(2);
  });

  it("counts an unapproved analysis with no execution status as waiting", () => {
    const result = summariseProjectAnalyses(
      [makeNode({ approvalStatus: null, executionStatus: null })],
      new Set(),
    );
    expect(result.get(PROJECT_A)!.waiting).toBe(1);
    expect(result.get(PROJECT_A)!.idle).toBe(0);
  });

  it("counts an unbuilt or undistributed analysis as waiting", () => {
    const result = summariseProjectAnalyses(
      [
        makeNode({ buildStatus: null }),
        makeNode({ distributionStatus: "starting" }),
      ],
      new Set(),
    );
    expect(result.get(PROJECT_A)!.waiting).toBe(2);
  });

  it("counts a fully-approved, built and distributed analysis with no execution status as idle", () => {
    const result = summariseProjectAnalyses([makeNode({})], new Set());
    expect(result.get(PROJECT_A)!.idle).toBe(1);
    expect(result.get(PROJECT_A)!.waiting).toBe(0);
  });

  it("classifies by execution status even when the Hub is incomplete", () => {
    const result = summariseProjectAnalyses(
      [makeNode({ executionStatus: PodStatus.Executing, buildStatus: null })],
      new Set(),
    );
    expect(result.get(PROJECT_A)!.running).toBe(1);
    expect(result.get(PROJECT_A)!.waiting).toBe(0);
  });

  it("sets hasDataStore from the supplied set", () => {
    const result = summariseProjectAnalyses(
      [makeNode({ projectId: PROJECT_A }), makeNode({ projectId: PROJECT_B })],
      new Set([PROJECT_A]),
    );
    expect(result.get(PROJECT_A)!.hasDataStore).toBe(true);
    expect(result.get(PROJECT_B)!.hasDataStore).toBe(false);
  });

  it("skips analysis nodes with no project id", () => {
    const orphan = {
      approval_status: "approved",
      analysis: {},
    } as unknown as AnalysisNode;
    expect(summariseProjectAnalyses([orphan], new Set()).size).toBe(0);
  });

  it("keeps every counted analysis in exactly one bucket", () => {
    const result = summariseProjectAnalyses(
      [
        makeNode({ executionStatus: PodStatus.Executed }),
        makeNode({ executionStatus: PodStatus.Failed }),
        makeNode({ executionStatus: PodStatus.Executing }),
        makeNode({ executionStatus: PodStatus.Stopped }),
        makeNode({ approvalStatus: null }),
        makeNode({}),
      ],
      new Set(),
    );
    const s = result.get(PROJECT_A)!;
    expect(
      s.executed + s.failed + s.running + s.stopped + s.waiting + s.idle,
    ).toBe(s.total);
  });
});
