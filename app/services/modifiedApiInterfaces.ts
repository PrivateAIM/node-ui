import type {
  Analysis,
  AnalysisNode,
  DetailedService,
  PodStatus,
} from "~/services/Api";

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

export interface ModifiedAnalysisNode extends Omit<
  AnalysisNode,
  "executionStatus"
> {
  project_name: string | undefined | null;
  analysis_name: string | undefined | null;
  expand: {
    [key: string]: string;
  };
  datastore: boolean;
  executionStatus: PodStatus | undefined | null;
  progress: number;
  hub_statuses: HubStatuses;
}
