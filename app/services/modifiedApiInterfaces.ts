import type {
  Analysis,
  AnalysisNode,
  DetailedService,
  PodStatus,
} from "~/services/Api";

export interface HubStatuses {
  approval_status: AnalysisNode["approval_status"];
  build_status: Analysis["build_status"];
  distribution_status: Analysis["distribution_status"];
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
  "execution_status"
> {
  project_name: string | undefined | null;
  analysis_name: string | undefined | null;
  expand: {
    [key: string]: string;
  };
  datastore: boolean;
  execution_status: PodStatus | undefined | null;
  progress: number;
  hub_statuses: HubStatuses;
}
