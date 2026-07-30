import {
  type Consumer,
  type DetailedService,
  PodStatus,
  type Route,
} from "~/services/Api";
import type { Analysis, AnalysisNode } from "~/services/hub";

export interface HubStatuses {
  approvalStatus: AnalysisNode["approvalStatus"];
  buildStatus: Analysis["buildStatus"];
  distributionStatus: Analysis["distributionStatus"];
}

export interface modifiedTimestamp {
  short: string;
  long: string;
  date: string;
  timestamp: number;
}

export interface ModifiedDetailedService extends Omit<
  DetailedService,
  "created_at" | "updated_at"
> {
  created_at: modifiedTimestamp;
  updated_at: modifiedTimestamp;
}

export interface ModifiedConsumer extends Omit<
  Consumer,
  "created_at" | "updated_at"
> {
  created_at: modifiedTimestamp;
  updated_at?: modifiedTimestamp;
}

export interface ModifiedRoute extends Omit<
  Route,
  "created_at" | "updated_at"
> {
  created_at: modifiedTimestamp;
  updated_at: modifiedTimestamp;
}

export interface ModifiedAnalysisNode extends Omit<
  AnalysisNode,
  "executionStatus"
> {
  projectName: string | undefined | null;
  analysisName: string | undefined | null;
  expand: {
    [key: string]: string;
  };
  datastore: boolean;
  // Deliberately the pod-orchestrator's status rather than the Hub's: the table
  // shows what the local containers are doing and falls back to the Hub's
  // `executionStatus` only when the pod-orchestrator has nothing to report.
  executionStatus: PodStatus | undefined | null;
  progress: number;
  hubStatuses: HubStatuses;
}

export interface ModifiedParsedAnalysisNode extends Omit<
  ModifiedAnalysisNode,
  "createdAt" | "updatedAt"
> {
  createdAt: modifiedTimestamp;
  updatedAt: modifiedTimestamp;
}
