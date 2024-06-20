export function parseUnixTimestamp(
  rowEntries: Map<string, string | number | null>[],
  keysToModify: string[],
): Map<string, string | number | null>[] {
  rowEntries.map((row) => {
    keysToModify.forEach((key) => {
      if (key in row) {
        const timestamp = row[key];
        const date = new Date(timestamp * 1000);
        row[key] = date.toUTCString();
      }
    });
  });
  return rowEntries;
}
