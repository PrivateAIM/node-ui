import { PodStatus } from "~/types/analysis";
import type { ModifiedAnalysisNode } from "~/components/analysis/AnalysesTable.vue";

export interface containerCount {
  started: number;
  running: number;
  failed: number;
  finished: number;
  stopped: number;
}

export function countAnalysisContainers(
  currentAnalyses: ModifiedAnalysisNode[],
): containerCount {
  const counts: containerCount = {
    started: 0,
    running: 0,
    finished: 0,
    failed: 0,
    stopped: 0,
  };
  for (const analysis of currentAnalyses) {
    const runStatus = analysis.execution_status;
    if (runStatus) {
      switch (runStatus) {
        case PodStatus.Started:
        case PodStatus.Starting:
          counts.started++;
          break;

        case PodStatus.Running:
          counts.running++;
          break;

        case PodStatus.Stopping:
        case PodStatus.Stopped:
          counts.stopped++;
          break;

        case PodStatus.Failed:
          counts.failed++;
          break;

        case PodStatus.Finished:
          counts.finished++;
          break;

        default:
          console.log(`${runStatus} not an acceptable option`);
      }
    }
  }
  return counts;
}
