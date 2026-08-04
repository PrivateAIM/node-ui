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

export type ProjectStatusKey =
  | "noDataStore"
  | "failed"
  | "waiting"
  | "running"
  | "stopped"
  | "idle"
  | "complete"
  | "noAnalyses";

export type ProjectStatusSeverity =
  | "danger"
  | "warn"
  | "info"
  | "success"
  | "secondary";

export interface ProjectStatus {
  key: ProjectStatusKey;
  label: string;
  severity: ProjectStatusSeverity;
  rank: number;
}

// Severity ordering, 1 is top priority (most egregious and requires attention)
const STATUS_RANK: Record<ProjectStatusKey, number> = {
  noDataStore: 1,
  failed: 2,
  waiting: 3,
  running: 4,
  stopped: 5,
  idle: 6,
  complete: 7,
  noAnalyses: 8,
};

const STATUS_SEVERITY: Record<ProjectStatusKey, ProjectStatusSeverity> = {
  noDataStore: "danger",
  failed: "danger",
  waiting: "warn",
  running: "info",
  stopped: "warn",
  idle: "secondary",
  complete: "success",
  noAnalyses: "secondary",
};

function status(key: ProjectStatusKey, label: string): ProjectStatus {
  return { key, label, severity: STATUS_SEVERITY[key], rank: STATUS_RANK[key] };
}

export function deriveProjectStatus(
  summary: ProjectAnalysisSummary,
  requireDataStore: boolean,
): ProjectStatus {
  if (summary.total === 0) return status("noAnalyses", "No analyses");
  if (!summary.hasDataStore && requireDataStore)
    return status("noDataStore", "No data store");
  if (summary.failed > 0) return status("failed", `${summary.failed} failed`);
  if (summary.running > 0)
    return status("running", `${summary.running} running`);
  if (summary.waiting > 0)
    return status("waiting", `${summary.waiting} waiting`);
  if (summary.stopped > 0)
    return status("stopped", `${summary.stopped} stopped`);
  if (summary.executed === summary.total) return status("complete", "Complete");
  return status("idle", "Idle");
}

export const PROJECT_STATUS_FILTER_OPTIONS: Array<{
  label: string;
  value: ProjectStatusKey;
}> = [
  { label: "No data store", value: "noDataStore" },
  { label: "Failed", value: "failed" },
  { label: "Waiting on Hub", value: "waiting" },
  { label: "Running", value: "running" },
  { label: "Stopped", value: "stopped" },
  { label: "Idle", value: "idle" },
  { label: "Complete", value: "complete" },
  { label: "No analyses", value: "noAnalyses" },
];
