import { PodStatus } from "~/services/Api";
import type { ModifiedAnalysisNode } from "~/services/modifiedApiInterfaces";

export interface containerCount {
  started: number;
  executing: number;
  failed: number;
  executed: number;
  stopped: number;
}

export function countAnalysisContainers(
  currentAnalyses: ModifiedAnalysisNode[],
): containerCount {
  const counts: containerCount = {
    started: 0,
    executing: 0,
    executed: 0,
    failed: 0,
    stopped: 0,
  };
  for (const analysis of currentAnalyses) {
    const executionStatus = analysis.execution_status;
    if (executionStatus) {
      switch (executionStatus) {
        case PodStatus.Started:
        case PodStatus.Starting:
          counts.started++;
          break;

        case PodStatus.Executing:
        case PodStatus.Running:
          counts.executing++;
          break;

        case PodStatus.Stopping:
        case PodStatus.Stopped:
          counts.stopped++;
          break;

        case PodStatus.Failed:
          counts.failed++;
          break;

        case PodStatus.Executed:
        case PodStatus.Finished:
          counts.executed++;
          break;

        default:
          console.log(`${executionStatus} not an acceptable option`);
      }
    }
  }
  return counts;
}
