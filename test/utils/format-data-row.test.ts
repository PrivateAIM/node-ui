// Test the format-data-row functions
import { expect, test, describe } from "vitest";
import { isRef } from "vue";
import { formatDataRow, parseUnixTimestamp } from "~/utils/format-data-row";
import { fakeAnalysisNodes } from "@/test/components/analysis/constants";
import type { ModifiedAnalysisNode } from "~/services/modifiedApiInterfaces";

test("Format Unix timestamp", () => {
  const fakeAnalysisNode = fakeAnalysisNodes[0]!;

  expect(fakeAnalysisNode.createdAt).toBe("2025-01-28T14:58:12Z");
  expect(fakeAnalysisNode.updatedAt).toBe("2025-03-18T09:11:14Z");

  // Overwrites the current fakeAnalysisNode
  const updatedAnalysisNode = parseUnixTimestamp(fakeAnalysisNode, [
    "createdAt",
    "updatedAt",
  ]);

  expect(fakeAnalysisNode).not.toStrictEqual(updatedAnalysisNode);

  expect(updatedAnalysisNode.createdAt).toStrictEqual({
    short: "28.01.2025",
    long: "28. Jan. 2025, 15:58",
    date: new Date("2025-01-28T14:58:12.000Z"),
    timestamp: 1738076292,
  });

  expect(updatedAnalysisNode.updatedAt).toStrictEqual({
    short: "18.03.2025",
    long: "18. März 2025, 10:11",
    date: new Date("2025-03-18T09:11:14.000Z"),
    timestamp: 1742289074,
  });
});

test("Format returned analysis data", () => {
  const baseNode = fakeAnalysisNodes[0]!;
  expect(baseNode.createdAt).toBe("2025-01-28T14:58:12Z");
  expect(baseNode.updatedAt).toBe("2025-03-18T09:11:14Z");

  const updatedRows = formatDataRow(
    fakeAnalysisNodes,
    ["createdAt", "updatedAt"],
    [],
  ) as ModifiedAnalysisNode[];

  const row = updatedRows[0]!;

  expect(row.createdAt).toStrictEqual({
    short: "28.01.2025",
    long: "28. Jan. 2025, 15:58",
    date: new Date("2025-01-28T14:58:12.000Z"),
    timestamp: 1738076292,
  });

  expect(row.updatedAt).toStrictEqual({
    short: "18.03.2025",
    long: "18. März 2025, 10:11",
    date: new Date("2025-03-18T09:11:14.000Z"),
    timestamp: 1742289074,
  });
});

test("formatDataRow returns null when passed null", () => {
  expect(formatDataRow(null, [], [])).toBeNull();
});

test("formatDataRow returns undefined when passed undefined", () => {
  expect(formatDataRow(undefined, [], [])).toBeUndefined();
});

describe("formatDataRow with rowExpansionKeys", () => {
  test("moves specified keys into expand object", () => {
    const rows = formatDataRow(
      fakeAnalysisNodes,
      [],
      ["executionStatus"],
    ) as ModifiedAnalysisNode[];

    const row = rows[0]!;
    expect(row.expand).toHaveProperty("executionStatus", "started");
    expect(Object.prototype.hasOwnProperty.call(row, "executionStatus")).toBe(false);
  });

  test("ignores rowExpansionKeys that are not present on the row", () => {
    const rows = formatDataRow(
      fakeAnalysisNodes,
      [],
      ["nonexistent_key"],
    ) as ModifiedAnalysisNode[];

    expect(rows[0]!.expand).toStrictEqual({});
  });

  test("moves multiple keys into a single expand object", () => {
    const rows = formatDataRow(
      fakeAnalysisNodes,
      [],
      ["executionStatus", "approvalStatus"],
    ) as ModifiedAnalysisNode[];

    const expand = rows[0]!.expand;
    expect(expand).toHaveProperty("executionStatus");
    expect(expand).toHaveProperty("approvalStatus");
  });
});

test("parseUnixTimestamp uses timeAgo ref for a date less than one week old", () => {
  const recentDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
  const node = { ...fakeAnalysisNodes[0]!, createdAt: recentDate.toISOString() };
  const result = parseUnixTimestamp(node, ["createdAt"]);
  // For recent dates, short is a Vue ComputedRef (timeAgo), not a plain string
  expect(isRef(result.createdAt.short)).toBe(true);
  expect(result.createdAt.date).toEqual(recentDate);
});
