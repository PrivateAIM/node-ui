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
  return rowEntries;
}

function parseUnixTimestamp(
  dataRow: Map<string, string | number | null>,
  keysToModify: string[],
): Map<string, string | number | null> {
  keysToModify.forEach((key) => {
    if (key in dataRow) {
      const timestamp = dataRow[key];
      let date: Date;
      if (isUnixTimestamp(timestamp)) {
        // If a unix epoch is returned
        date = new Date(timestamp * 1000);
      } else {
        // If a UTC T/Z timestamp returned
        date = new Date(timestamp);
      }
      dataRow[key] = date.toUTCString();
    }
  });
  return dataRow;
}

function isUnixTimestamp(value: number): boolean {
  // Unix timestamp should be a number and within reasonable range
  return value > 0 && value < 2147483647;
}
