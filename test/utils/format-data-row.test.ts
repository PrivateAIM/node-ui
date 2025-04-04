import { expect, test } from "vitest";
import { formatDataRow, parseUnixTimestamp } from "~/utils/format-data-row";
import {
  fakeAnalysisData,
  expectedFormattedAnalysisData,
  expectedDateParsedRow,
} from "./row-test-data";

test("Fake data is different", () => {
  expect(fakeAnalysisData).not.toBe(expectedFormattedAnalysisData);
});

test("Format Unix timestamp", () => {
  expect(
    parseUnixTimestamp(fakeAnalysisData[0], ["created_at", "updated_at"]),
  ).not.toBe(expectedDateParsedRow);
});

test("Format returned analysis data", () => {
  expect(
    formatDataRow(fakeAnalysisData, ["created_at", "updated_at"], []),
  ).toStrictEqual(expectedFormattedAnalysisData);
});
