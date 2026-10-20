import { type PodProgressResponse, PodStatus } from "~/services/Api";
import type { ModifiedAnalysisNode } from "~/services/modifiedApiInterfaces";

const TERMINAL_HUB_STATUSES: Array<PodStatus | null | undefined> = [
  PodStatus.Failed,
  PodStatus.Executed,
];

/** Normalises execution_progress for terminal run states, mutating and returning the row. */
export function setProgress(
  analysis: ModifiedAnalysisNode,
): ModifiedAnalysisNode {
  analysis.execution_progress = analysis.execution_progress
    ? analysis.execution_progress
    : 0;

  const currentRunStatus = analysis.execution_status;
  if (currentRunStatus) {
    if (currentRunStatus === PodStatus.Failed) {
      analysis.execution_progress = 0;
    } else if (currentRunStatus === PodStatus.Executed) {
      analysis.execution_progress = 100;
    }
  }
  return analysis;
}

/** Returns the ProgressBar CSS variable override for a progress percentage. */
export function determineProgressBarColor(progress: number) {
  let color: string;

  if (!progress) {
    color = "#FFFFFF";
  } else if (progress < 33) {
    color = "#ef4444";
  } else if (progress < 66) {
    color = "#f59e0b";
  } else {
    color = "#10b981";
  }

  return {
    "--p-progressbar-value-background": color,
  };
}

/** Enriches an analysis node row in place with project, data store and pod orchestrator data. */
export function parseAnalysis(
  analysisEntry: ModifiedAnalysisNode,
  executionStatuses: PodProgressResponse | undefined,
  projectNames: Map<string, string>,
  dataStoreProjectIds: Set<string>,
): ModifiedAnalysisNode {
  const projId = analysisEntry.analysis?.project_id;
  const analysisId = analysisEntry.analysis_id;
  analysisEntry.analysis_name =
    analysisEntry.analysis?.display_name ??
    analysisEntry.analysis?.name ??
    analysisId;
  if (projId) {
    analysisEntry.project_name = projectNames.has(projId)
      ? projectNames.get(projId)
      : "";
    analysisEntry.datastore = dataStoreProjectIds.has(projId);
  }
  if (executionStatuses && analysisId in executionStatuses) {
    const podStatus = executionStatuses[analysisId]!;
    analysisEntry.execution_status = podStatus.status;
    analysisEntry.execution_progress =
      podStatus.progress ?? analysisEntry.execution_progress;
  } else {
    if (!TERMINAL_HUB_STATUSES.includes(analysisEntry.execution_status)) {
      analysisEntry.execution_status = null;
    }
  }
  analysisEntry.hub_statuses = {
    approval_status: analysisEntry.approval_status,
    build_status: analysisEntry.analysis?.build_status ?? null,
    distribution_status: analysisEntry.analysis?.distribution_status ?? null,
  };
  return setProgress(analysisEntry);
}
