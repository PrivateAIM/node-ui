export interface FlatLogLine {
  content: string;
  level?: string | null;
  timestamp: string;
  isStacktrace: boolean;
}
