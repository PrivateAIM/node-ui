export function parseUnixTimestamp(
  rowEntries: Map<string, string | number | null>[],
  keysToModify: string[],
): Map<string, string | number | null>[] {
  rowEntries.map((row) => {
    keysToModify.forEach((key) => {
      if (key in row) {
        const timestamp = row[key];
        let date: Date;
        if (isUnixTimestamp(timestamp)) {
          // If a unix epoch is returned
          date = new Date(timestamp * 1000);
        } else {
          // If a UTC T/Z timestamp returned
          date = new Date(timestamp);
        }
        row[key] = date.toUTCString();
      }
    });
  });
  return rowEntries;
}

function isUnixTimestamp(value: number): boolean {
  // Unix timestamp should be a number and within reasonable range
  return value > 0 && value < 2147483647;
}
