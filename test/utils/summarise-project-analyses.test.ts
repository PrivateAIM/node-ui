import { describe, expect, it } from "vitest";
import {
  deriveProjectStatus,
  emptyProjectAnalysisSummary,
  PROJECT_STATUS_FILTER_OPTIONS,
  type ProjectAnalysisSummary,
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

describe("deriveProjectStatus", () => {
  function summary(overrides: Partial<ProjectAnalysisSummary> = {}) {
    return { ...emptyProjectAnalysisSummary(true), ...overrides };
  }

  it("reports no analyses when the project has none on this node", () => {
    const status = deriveProjectStatus(summary({ total: 0 }), true);
    expect(status.key).toBe("noAnalyses");
    expect(status.severity).toBe("secondary");
    expect(status.rank).toBe(7);
  });

  it("reports a missing data store ahead of failures", () => {
    const status = deriveProjectStatus(
      summary({ total: 4, failed: 3, hasDataStore: false }),
      true,
    );
    expect(status.key).toBe("noDataStore");
    expect(status.label).toBe("No data store");
    expect(status.severity).toBe("danger");
    expect(status.rank).toBe(1);
  });

  it("suppresses the data store check when a data store is not required", () => {
    const status = deriveProjectStatus(
      summary({ total: 4, failed: 3, hasDataStore: false }),
      false,
    );
    expect(status.key).toBe("failed");
  });

  it("reports failures with a count", () => {
    const status = deriveProjectStatus(summary({ total: 5, failed: 2 }), true);
    expect(status.label).toBe("2 failed");
    expect(status.severity).toBe("danger");
    expect(status.rank).toBe(2);
  });

  it("reports running ahead of waiting", () => {
    const status = deriveProjectStatus(
      summary({ total: 5, running: 1, waiting: 3 }),
      true,
    );
    expect(status.label).toBe("1 running");
    expect(status.severity).toBe("info");
    expect(status.rank).toBe(4);
  });

  it("reports waiting when nothing is running", () => {
    const status = deriveProjectStatus(summary({ total: 3, waiting: 3 }), true);
    expect(status.label).toBe("3 waiting");
    expect(status.severity).toBe("warn");
    expect(status.rank).toBe(3);
  });

  it("reports complete when every analysis has executed", () => {
    const status = deriveProjectStatus(
      summary({ total: 4, executed: 4 }),
      true,
    );
    expect(status.key).toBe("complete");
    expect(status.label).toBe("Complete");
    expect(status.severity).toBe("success");
    expect(status.rank).toBe(6);
  });

  it("falls through to idle", () => {
    const status = deriveProjectStatus(
      summary({ total: 4, executed: 1, stopped: 1, idle: 2 }),
      true,
    );
    expect(status.key).toBe("idle");
    expect(status.label).toBe("Idle");
    expect(status.rank).toBe(5);
  });

  it("sorts worst-first by rank", () => {
    const ranks = [
      deriveProjectStatus(summary({ total: 1, hasDataStore: false }), true)
        .rank,
      deriveProjectStatus(summary({ total: 1, failed: 1 }), true).rank,
      deriveProjectStatus(summary({ total: 1, waiting: 1 }), true).rank,
      deriveProjectStatus(summary({ total: 1, running: 1 }), true).rank,
      deriveProjectStatus(summary({ total: 2, executed: 1, idle: 1 }), true)
        .rank,
      deriveProjectStatus(summary({ total: 1, executed: 1 }), true).rank,
      deriveProjectStatus(summary({ total: 0 }), true).rank,
    ];
    expect(ranks).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
});

describe("PROJECT_STATUS_FILTER_OPTIONS", () => {
  it("offers one option per status key", () => {
    expect(PROJECT_STATUS_FILTER_OPTIONS.map((o) => o.value)).toEqual([
      "noDataStore",
      "failed",
      "waiting",
      "running",
      "idle",
      "complete",
      "noAnalyses",
    ]);
  });
});
