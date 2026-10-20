import { type PodProgressResponse, PodStatus } from "~/services/Api";
import type { ModifiedAnalysisNode } from "~/services/modifiedApiInterfaces";

const TERMINAL_HUB_STATUSES: Array<PodStatus | null | undefined> = [
  PodStatus.Failed,
  PodStatus.Executed,
];

/** Normalises executionProgress for terminal run states, mutating and returning the row. */
export function setProgress(
  analysis: ModifiedAnalysisNode,
): ModifiedAnalysisNode {
  analysis.executionProgress = analysis.executionProgress
    ? analysis.executionProgress
    : 0;

  const currentRunStatus = analysis.executionStatus;
  if (currentRunStatus) {
    if (currentRunStatus === PodStatus.Failed) {
      analysis.executionProgress = 0;
    } else if (currentRunStatus === PodStatus.Executed) {
      analysis.executionProgress = 100;
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
  const projId = analysisEntry.analysis?.projectId;
  const analysisId = analysisEntry.analysisId;
  analysisEntry.analysis_name =
    analysisEntry.analysis?.displayName ??
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
    analysisEntry.executionStatus = podStatus.status;
    analysisEntry.executionProgress =
      podStatus.progress ?? analysisEntry.executionProgress;
  } else {
    if (!TERMINAL_HUB_STATUSES.includes(analysisEntry.executionStatus)) {
      analysisEntry.executionStatus = null;
    }
  }
  analysisEntry.hub_statuses = {
    approvalStatus: analysisEntry.approvalStatus,
    buildStatus: analysisEntry.analysis?.buildStatus ?? null,
    distributionStatus: analysisEntry.analysis?.distributionStatus ?? null,
  };
  return setProgress(analysisEntry);
}
