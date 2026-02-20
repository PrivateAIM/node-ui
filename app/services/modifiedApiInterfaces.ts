import {
  type AnalysisNode,
  type Consumer,
  type DetailedService,
  PodStatus,
  type Route,
} from "~/services/Api";

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

export interface ModifiedAnalysisNode extends Omit<AnalysisNode, "run_status"> {
  project_name: string | undefined;
  expand: {
    [key: string]: string;
  };
  datastore: boolean;
  run_status: PodStatus | null;
  progress: number;
}
