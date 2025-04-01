import type { Consumer, DetailedService, Route } from "~/services/Api";

export interface modifiedTimestamp {
  short: string;
  long: string;
  date: string;
  timestamp: number;
}

export interface ModifiedDetailedService
  extends Omit<DetailedService, "created_at" | "updated_at"> {
  created_at: modifiedTimestamp;
  updated_at: modifiedTimestamp;
}

export interface ModifiedConsumer
  extends Omit<Consumer, "created_at" | "updated_at"> {
  created_at: modifiedTimestamp;
  updated_at?: modifiedTimestamp;
}

export interface ModifiedRoute
  extends Omit<Route, "created_at" | "updated_at"> {
  created_at: modifiedTimestamp;
  updated_at: modifiedTimestamp;
}
