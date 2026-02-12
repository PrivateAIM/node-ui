// Test the format-data-row functions
import { expect, test } from "vitest";
import { formatDataRow, parseUnixTimestamp } from "~/utils/format-data-row";
import { fakeAnalysisNodes } from "~/test/components/analysis/constants";
import type { ModifiedAnalysisNode } from "~/services/modifiedApiInterfaces";

test("Format Unix timestamp", () => {
  const fakeAnalysisNode = fakeAnalysisNodes[0];

  expect(fakeAnalysisNode.created_at).toBe("2025-01-28T14:58:12Z");
  expect(fakeAnalysisNode.updated_at).toBe("2025-03-18T09:11:14Z");

  // Overwrites the current fakeAnalysisNode
  const updatedAnalysisNode = parseUnixTimestamp(fakeAnalysisNode, [
    "created_at",
    "updated_at",
  ]);

  expect(fakeAnalysisNode).not.toStrictEqual(updatedAnalysisNode);

  expect(updatedAnalysisNode.created_at).toStrictEqual({
    short: "28.01.2025",
    long: "28. Jan. 2025, 15:58",
    date: new Date("2025-01-28T14:58:12.000Z"),
    timestamp: 1738076292,
  });

  expect(updatedAnalysisNode.updated_at).toStrictEqual({
    short: "18.03.2025",
    long: "18. März 2025, 10:11",
    date: new Date("2025-03-18T09:11:14.000Z"),
    timestamp: 1742289074,
  });
});

test("Format returned analysis data", () => {
  expect(fakeAnalysisNodes[0].created_at).toBe("2025-01-28T14:58:12Z");
  expect(fakeAnalysisNodes[0].updated_at).toBe("2025-03-18T09:11:14Z");

  const updatedRows = formatDataRow(
    fakeAnalysisNodes,
    ["created_at", "updated_at"],
    [],
  ) as ModifiedAnalysisNode[];

  expect(updatedRows[0].created_at).toStrictEqual({
    short: "28.01.2025",
    long: "28. Jan. 2025, 15:58",
    date: new Date("2025-01-28T14:58:12.000Z"),
    timestamp: 1738076292,
  });

  expect(updatedRows[0].updated_at).toStrictEqual({
    short: "18.03.2025",
    long: "18. März 2025, 10:11",
    date: new Date("2025-03-18T09:11:14.000Z"),
    timestamp: 1742289074,
  });
});
