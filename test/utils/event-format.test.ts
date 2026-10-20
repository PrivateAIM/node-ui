import { afterEach, describe, expect, it, vi } from "vitest";
import { type EventLog, ServiceTag } from "~/services/Api";
import { EventLogLevelTag } from "~/types/eventTag";
import {
  countLogLevels,
  filterEventsByTags,
  formatEventName,
  formatTag,
  formatTimestampPart,
  getLogLevelColor,
} from "~/utils/event-format";

function makeEvent(overrides: Partial<EventLog> = {}): EventLog {
  return {
    event_name: "node.settings.get.success",
    service: ServiceTag.HubAdapter,
    level: "info",
    timestamp: "2026-05-31T12:00:00Z",
    message: "",
    ...overrides,
  } as EventLog;
}

const events = [
  makeEvent({ level: "info" }),
  makeEvent({ level: "error", service: ServiceTag.Hub }),
  makeEvent({ level: "warning" }),
  makeEvent({ level: "ERROR" }),
];

describe("countLogLevels", () => {
  it("counts each level case-insensitively in error, warning, info order", () => {
    expect(
      countLogLevels(events).map(({ label, value }) => [label, value]),
    ).toEqual([
      [EventLogLevelTag.Error, 2],
      [EventLogLevelTag.Warning, 1],
      [EventLogLevelTag.Info, 1],
    ]);
  });
});

describe("filterEventsByTags", () => {
  it("keeps everything without filters", () => {
    expect(filterEventsByTags(events, [])).toEqual(events);
  });

  it("filters by level and by service", () => {
    expect(filterEventsByTags(events, [EventLogLevelTag.Error])).toHaveLength(
      2,
    );
    expect(
      filterEventsByTags(events, [EventLogLevelTag.Error, ServiceTag.Hub]),
    ).toEqual([events[1]]);
  });
});

describe("formatting helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("formats event names", () => {
    expect(formatEventName("node.settings.get")).toBe("NODE-SETTINGS-GET");
  });

  it("colours level and service tags", () => {
    expect(formatTag(EventLogLevelTag.Error, true).background).toBe("#ef4444");
    expect(formatTag("unknown", true).background).toBe("#8b5cf6");
    expect(formatTag(ServiceTag.Hub, false).background).toBe("#14b8a6");
  });

  it("maps log levels to border colours", () => {
    expect(getLogLevelColor("WARNING")).toBe("#eab308");
    expect(getLogLevelColor(undefined)).toBe("transparent");
    expect(getLogLevelColor("debug")).toBe("transparent");
  });

  it("returns an empty string for unparseable timestamps", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const formatter = new Intl.DateTimeFormat(undefined, {
      dateStyle: "short",
    });

    expect(formatTimestampPart("not a date", formatter)).toBe("");
    expect(formatTimestampPart("2026-05-31T12:00:00Z", formatter)).toBe(
      formatter.format(new Date("2026-05-31T12:00:00Z")),
    );
  });
});
