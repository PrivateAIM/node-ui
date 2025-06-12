import { AnalysisNodeRunStatus } from "~/types/analysis";
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
    const runStatus = analysis.run_status;
    if (runStatus) {
      switch (runStatus) {
        case AnalysisNodeRunStatus.Started:
        case AnalysisNodeRunStatus.Starting:
          counts.started++;
          break;

        case AnalysisNodeRunStatus.Running:
          counts.running++;
          break;

        case AnalysisNodeRunStatus.Stopping:
        case AnalysisNodeRunStatus.Stopped:
          counts.stopped++;
          break;

        case AnalysisNodeRunStatus.Failed:
          counts.failed++;
          break;

        case AnalysisNodeRunStatus.Finished:
          counts.finished++;
          break;

        default:
          console.log(`${runStatus} not an acceptable option`);
      }
    }
  }
  return counts;
}
