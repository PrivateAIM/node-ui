import { describe, expect, it } from "vitest";
import { flattenLogs } from "~/types/logs";
import type { PodLog } from "~/services/Api";

const makeLog = (overrides: Partial<PodLog> = {}): PodLog => ({
  timestamp: "2024-01-01T00:00:00Z",
  message: "hello",
  level: "INFO",
  stacktrace: null,
  ...overrides,
});

describe("flattenLogs", () => {
  it("returns empty array for empty input", () => {
    expect(flattenLogs([])).toEqual([]);
  });

  it("flattens a single log with no stacktrace into one line", () => {
    const result = flattenLogs([makeLog({ message: "hello", level: "INFO" })]);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      content: "hello",
      level: "INFO",
      timestamp: "2024-01-01T00:00:00Z",
      isStacktrace: false,
    });
  });

  it("flattens a log with a two-line stacktrace into three lines", () => {
    const result = flattenLogs([
      makeLog({ message: "boom", level: "ERROR", stacktrace: "at A\nat B" }),
    ]);
    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({ content: "boom", isStacktrace: false });
    expect(result[1]).toMatchObject({ content: "at A", isStacktrace: true, level: null });
    expect(result[2]).toMatchObject({ content: "at B", isStacktrace: true, level: null });
  });

  it("stacktrace lines inherit the parent timestamp", () => {
    const result = flattenLogs([
      makeLog({ timestamp: "2024-06-01T12:00:00Z", stacktrace: "frame" }),
    ]);
    expect(result[1].timestamp).toBe("2024-06-01T12:00:00Z");
  });

  it("handles multiple logs in order", () => {
    const result = flattenLogs([
      makeLog({ message: "first" }),
      makeLog({ message: "second" }),
    ]);
    expect(result).toHaveLength(2);
    expect(result[0].content).toBe("first");
    expect(result[1].content).toBe("second");
  });

  it("handles null level", () => {
    const result = flattenLogs([makeLog({ level: null })]);
    expect(result[0].level).toBeNull();
  });
});
