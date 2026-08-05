import { type AnalysisNode, PodStatus } from "~/services/Api";
import { ApprovalStatus } from "~/types/node";
import { ProcessStatus } from "~/types/analysis";

export interface ProjectAnalysisSummary {
  total: number;
  executed: number;
  running: number;
  failed: number;
  stopped: number;
  waiting: number;
  idle: number;
  hasDataStore: boolean;
}

export function emptyProjectAnalysisSummary(
  hasDataStore: boolean,
): ProjectAnalysisSummary {
  return {
    total: 0,
    executed: 0,
    running: 0,
    failed: 0,
    stopped: 0,
    waiting: 0,
    idle: 0,
    hasDataStore,
  };
}

// An analysis is still waiting to be approved, built or distributed
function isWaitingOnHub(analysisNode: AnalysisNode): boolean {
  if (analysisNode.approval_status !== ApprovalStatus.Approved) return true;
  if (analysisNode.analysis?.build_status !== ProcessStatus.Executed)
    return true;
  return analysisNode.analysis?.distribution_status !== ProcessStatus.Executed;
}

export function summariseProjectAnalyses(
  analysisNodes: AnalysisNode[],
  dataStoreProjectIds: Set<string>,
): Map<string, ProjectAnalysisSummary> {
  const summaries = new Map<string, ProjectAnalysisSummary>();

  for (const analysisNode of analysisNodes) {
    const projectId = analysisNode.analysis?.project_id;
    if (!projectId) continue;

    let summary = summaries.get(projectId);
    if (!summary) {
      summary = emptyProjectAnalysisSummary(dataStoreProjectIds.has(projectId));
      summaries.set(projectId, summary);
    }
    summary.total++;

    switch (analysisNode.execution_status) {
      case PodStatus.Failed:
        summary.failed++;
        break;

      case PodStatus.Executed:
        summary.executed++;
        break;

      case PodStatus.Starting:
      case PodStatus.Started:
      case PodStatus.Executing:
        summary.running++;
        break;

      case PodStatus.Stopping:
      case PodStatus.Stopped:
        summary.stopped++;
        break;

      default:
        if (isWaitingOnHub(analysisNode)) {
          summary.waiting++;
        } else {
          summary.idle++;
        }
    }
  }

  return summaries;
}
