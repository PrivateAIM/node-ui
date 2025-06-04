/**
 * Formats the row of data by parsing unix time stamps and compiling specified keys into new object arrays for
 * further expansion within the table
 * @param rowEntries - array of data rows
 * @param datetimeKeys - unix timestamp keys
 * @param rowExpansionKeys - data keys that will be moved to an expandable subset
 */
export function formatDataRow(
  rowEntries,
  datetimeKeys: string[],
  rowExpansionKeys: string[],
) {
  if (rowEntries) {
    console.log(rowEntries);
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
        dataRow[key] = {
          short: formatDate(date),
          long: date.toUTCString(),
          date: date,
          timestamp: date.getTime() / 1000,
        };
      }
    }
  });
  return dataRow;
}

const formatDate = (value: Date) => {
  return value.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

function isUnixTimestamp(value: number): boolean {
  // Unix timestamp should be a number and within reasonable range
  return value > 0 && value < 2147483647;
}
