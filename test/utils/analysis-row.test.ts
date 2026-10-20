import { describe, expect, it } from "vitest";
import { PodStatus } from "~/services/Api";
import type { ModifiedAnalysisNode } from "~/services/modifiedApiInterfaces";
import {
  determineProgressBarColor,
  parseAnalysis,
  setProgress,
} from "~/utils/analysis-row";
import { fakeBaseAnalysisNode } from "../components/analysis/constants";

const projectId = fakeBaseAnalysisNode.analysis!.project_id;

function makeRow(
  overrides: Partial<ModifiedAnalysisNode> = {},
): ModifiedAnalysisNode {
  return {
    ...structuredClone(fakeBaseAnalysisNode),
    ...overrides,
  } as ModifiedAnalysisNode;
}

describe("setProgress", () => {
  it("defaults missing progress to 0", () => {
    const row = makeRow({
      execution_status: PodStatus.Executing,
      execution_progress: undefined,
    });
    expect(setProgress(row).execution_progress).toBe(0);
  });

  it("forces 100 for executed and 0 for failed", () => {
    expect(
      setProgress(
        makeRow({
          execution_status: PodStatus.Executed,
          execution_progress: 40,
        }),
      ).execution_progress,
    ).toBe(100);
    expect(
      setProgress(
        makeRow({ execution_status: PodStatus.Failed, execution_progress: 40 }),
      ).execution_progress,
    ).toBe(0);
  });

  it("keeps progress for running statuses", () => {
    const row = makeRow({
      execution_status: PodStatus.Executing,
      execution_progress: 42,
    });
    expect(setProgress(row).execution_progress).toBe(42);
  });
});

describe("determineProgressBarColor", () => {
  it.each([
    [0, "#FFFFFF"],
    [10, "#ef4444"],
    [50, "#f59e0b"],
    [90, "#10b981"],
  ])("progress %i maps to %s", (progress, color) => {
    expect(determineProgressBarColor(progress)).toEqual({
      "--p-progressbar-value-background": color,
    });
  });
});

describe("parseAnalysis", () => {
  const projectNames = new Map([[projectId, "use-case-1"]]);

  it("fills names, data store flag and hub statuses", () => {
    const row = parseAnalysis(
      makeRow(),
      undefined,
      projectNames,
      new Set([projectId]),
    );

    expect(row.analysis_name).toBe("T006");
    expect(row.project_name).toBe("use-case-1");
    expect(row.datastore).toBe(true);
    expect(row.hub_statuses).toEqual({
      approval_status: "approved",
      build_status: "starting",
      distribution_status: null,
    });
  });

  it("uses an empty project name and no data store for unknown projects", () => {
    const row = parseAnalysis(makeRow(), undefined, new Map(), new Set());

    expect(row.project_name).toBe("");
    expect(row.datastore).toBe(false);
  });

  it("takes status and progress from the pod orchestrator", () => {
    const row = parseAnalysis(
      makeRow({ execution_status: PodStatus.Started, execution_progress: 0 }),
      {
        [fakeBaseAnalysisNode.analysis_id]: {
          status: PodStatus.Executing,
          progress: 30,
        },
      },
      projectNames,
      new Set(),
    );

    expect(row.execution_status).toBe(PodStatus.Executing);
    expect(row.execution_progress).toBe(30);
  });

  it("clears non-terminal statuses the pod orchestrator does not report", () => {
    const row = parseAnalysis(
      makeRow({ execution_status: PodStatus.Started }),
      {},
      projectNames,
      new Set(),
    );
    expect(row.execution_status).toBeNull();
  });

  it("keeps terminal statuses the pod orchestrator does not report", () => {
    const row = parseAnalysis(
      makeRow({ execution_status: PodStatus.Executed }),
      {},
      projectNames,
      new Set(),
    );
    expect(row.execution_status).toBe(PodStatus.Executed);
    expect(row.execution_progress).toBe(100);
  });
});
