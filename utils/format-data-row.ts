/**
 * Formats the row of data by parsing unix time stamps and compiling specified keys into new object arrays for
 * further expansion within the table
 * @param rowEntries - array of data rows
 * @param datetimeKeys - unix timestamp keys
 * @param rowExpansionKeys - data keys that will be moved to an expandable subset
 */
import { useTimeAgo } from "@vueuse/core";

export function formatDataRow(
  rowEntries,
  datetimeKeys: string[],
  rowExpansionKeys: string[],
) {
  if (rowEntries) {
    rowEntries.map((row) => {
      parseUnixTimestamp(row, datetimeKeys);
      const expandData: object = {};
      rowExpansionKeys.forEach((key) => {
        if (key in row) {
          expandData[key] = row[key];
          delete row[key];
        }
      });
      row["expand"] = expandData;
    });
  }
  return rowEntries;
}

export function parseUnixTimestamp(
  dataRow: object,
  keysToModify: string[],
): object {
  keysToModify.forEach((key) => {
    if (key in dataRow) {
      const timestamp = dataRow[key];
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

        dataRow[key] = {
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
  return dataRow;
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
