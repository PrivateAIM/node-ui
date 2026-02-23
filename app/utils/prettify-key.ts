export function prettifyKey(metadataKey: string): string {
  const keyParts = metadataKey.split("_").map((word) => {
    return word[0].toUpperCase() + word.slice(1);
  });
  return keyParts.join(" ");
}
