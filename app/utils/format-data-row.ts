/**
 * Formats the row of data by parsing unix time stamps and compiling specified keys into new object arrays for
 * further expansion within the table
 * @param rowEntries - array of data rows
 * @param datetimeKeys - unix timestamp keys
 * @param rowExpansionKeys - data keys that will be moved to an expandable subset
 */
import { useTimeAgo } from "@vueuse/core";
import type { DetailedService, Route } from "~/services/Api";
import type { AnalysisNode, ProjectNode } from "~/services/hub";
import type { ModifiedDetailedService } from "~/services/modifiedApiInterfaces";

type FormattableRow =
  | ProjectNode
  | DetailedService
  | ModifiedDetailedService
  | Route
  | AnalysisNode;

export function formatDataRow(
  rowEntries: FormattableRow[] | null | undefined,
  datetimeKeys: string[],
  rowExpansionKeys: string[],
) {
  if (rowEntries) {
    return rowEntries.map((row: FormattableRow) => {
      // Create a shallow copy of the row
      const newRow = { ...row };

      // parseUnixTimestamp now returns a new object, so assign it back
      const parsedRow = parseUnixTimestamp(newRow, datetimeKeys);

      const expandData: object = {};
      rowExpansionKeys.forEach((key) => {
        if (key in parsedRow) {
          expandData[key] = parsedRow[key];
          delete parsedRow[key];
        }
      });
      parsedRow["expand"] = expandData;

      return parsedRow;
    });
  }
  return rowEntries;
}

export function parseUnixTimestamp(
  dataRow: FormattableRow,
  keysToModify: string[],
) {
  const result = { ...dataRow };
  keysToModify.forEach((key) => {
    if (key in result) {
      const timestamp = result[key];
      let date: Date;
      if (typeof timestamp !== "object") {
        // If it is an object, then no need to parse
        if (typeof timestamp === "number" && isUnixTimestamp(timestamp)) {
          date = new Date(timestamp * 1000);
        } else {
          date = new Date(timestamp);
        }

        const timeAgo = useTimeAgo(date);

        const shortDate = isLessThanOneWeekAgo(date)
          ? timeAgo
          : date.toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

        result[key] = {
          short: shortDate,
          long: date.toLocaleString("de-DE", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          date: date,
          timestamp: date.getTime() / 1000,
        };
      }
    }
  });
  return result;
}

function isLessThanOneWeekAgo(date: Date): boolean {
  const now = Date.now();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  return date.getTime() > now - oneWeekMs;
}

function isUnixTimestamp(value: number): boolean {
  // Unix timestamp should be a number and within reasonable range
  return value > 0 && value < 2147483647;
}
