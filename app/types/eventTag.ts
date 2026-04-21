import { type ServiceTag } from "~/services/Api";

export const EventLogLevelTag = {
  Info: "Info",
  Warning: "Warning",
  Error: "Error",
} as const;

export type EventLogLevelTag =
  (typeof EventLogLevelTag)[keyof typeof EventLogLevelTag];
export type EventTag = ServiceTag | EventLogLevelTag;