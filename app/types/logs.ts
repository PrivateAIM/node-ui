import type { PodLog } from "~/services/Api";

export interface FlatLogLine {
  content: string;
  level?: string | null;
  timestamp: string;
  isStacktrace: boolean;
}

export function flattenLogs(logs: PodLog[]): FlatLogLine[] {
  return logs.flatMap((entry) => [
    {
      content: entry.message,
      level: entry.level,
      timestamp: entry.timestamp,
      isStacktrace: false,
    },
    ...(entry.stacktrace?.split("\n") ?? []).map((line) => ({
      content: line,
      level: null,
      timestamp: entry.timestamp,
      isStacktrace: true,
    })),
  ]);
}
