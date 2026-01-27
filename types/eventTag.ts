export const EventServiceTag = {
  Hub: "Hub",
  HubAdapter: "Hub Adapter",
  PodOrchestrator: "Pod Orchestrator",
  Storage: "Storage",
  Kong: "Kong",
  Authentication: "Authentication",
  Autostart: "Autostart",
};

export const EventLogLevelTag = {
  Info: "Info",
  Warning: "Warning",
  Error: "Error",
};

export type EventServiceTag =
  (typeof EventServiceTag)[keyof typeof EventServiceTag];
export type EventLogLevelTag =
  (typeof EventLogLevelTag)[keyof typeof EventLogLevelTag];
export type EventTag = EventServiceTag | EventLogLevelTag;
