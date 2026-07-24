// Mirrors the hub adapter's kong_ident.parse_tags: relationships between FLAME
// entities and Kong entities are carried in tags like "project:<uuid>",
// "datastore:<kong service id>", and "type:<s3|fhir>". Valueless tags
// (e.g. "health") are skipped.
export function parseKongTags(
  tags: string[] | null | undefined,
): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (const tag of tags ?? []) {
    const separatorIdx = tag.indexOf(":");
    if (separatorIdx > 0) {
      parsed[tag.slice(0, separatorIdx)] = tag.slice(separatorIdx + 1);
    }
  }
  return parsed;
}
