import { type EventLog, ServiceTag } from "~/services/Api";
import { EventLogLevelTag, type EventTag } from "~/types/eventTag";

export const logLevelColorMap = new Map([
  [EventLogLevelTag.Error, "#ef4444"],
  [EventLogLevelTag.Warning, "#eab308"],
  [EventLogLevelTag.Info, "#3b82f6"],
]);

export interface LogLevelDistribution {
  label: EventLogLevelTag;
  color: string;
  value: number;
}

/** Counts events per log level, in the order of logLevelColorMap. */
export function countLogLevels(events: EventLog[]): LogLevelDistribution[] {
  const counts = Array.from(logLevelColorMap, ([label, color]) => ({
    label,
    color,
    value: 0,
  }));

  events.forEach((event) => {
    const level = event.level?.toLowerCase();
    counts.forEach((dist) => {
      if (level === dist.label.toLowerCase()) {
        dist.value++;
      }
    });
  });

  return counts;
}

/** Keeps the events matching the selected level and service tags; no selection of a kind keeps all. */
export function filterEventsByTags(
  events: EventLog[],
  appliedFilters: EventTag[],
): EventLog[] {
  const selectedLevels = appliedFilters
    .filter((f) =>
      Object.values(EventLogLevelTag).includes(f as EventLogLevelTag),
    )
    .map((f) => f.toLowerCase());
  const selectedServices = appliedFilters.filter((f) =>
    Object.values(ServiceTag).includes(f as ServiceTag),
  );

  let result = events;

  if (selectedLevels.length > 0) {
    result = result.filter((e) =>
      selectedLevels.includes(e.level?.toLowerCase()),
    );
  }

  if (selectedServices.length > 0) {
    result = result.filter((e) =>
      selectedServices.includes(e.service as ServiceTag),
    );
  }

  return result;
}

export function formatTag(tag: string, isLevel: boolean) {
  if (isLevel) {
    return {
      background: logLevelColorMap.get(tag as EventLogLevelTag) ?? "#8b5cf6",
      color: "#ffffff",
    };
  }
  return { background: "#14b8a6", color: "#ffffff" };
}

export function formatEventName(eventName: string): string {
  return eventName.toUpperCase().split(".").join("-");
}

export function formatTimestampPart(
  timestamp: string,
  formatter: Intl.DateTimeFormat,
): string {
  try {
    return formatter.format(new Date(timestamp));
  } catch (error) {
    console.error(`Timestamp: ${timestamp}; Error: ${error}`);
    return "";
  }
}

export function getLogLevelColor(level: string | undefined): string {
  if (!level) return "transparent";

  const normalized = level.toLowerCase();
  for (const [tag, color] of logLevelColorMap) {
    if (tag.toLowerCase() === normalized) return color;
  }
  return "transparent";
}
