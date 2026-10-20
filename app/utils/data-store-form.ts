import type { ProjectNode } from "~/services/Api";
import type { AvailableProject } from "~/types/dataStore";

export const ACCEPTED_PROTOCOLS = [
  "grpc",
  "grpcs",
  "http",
  "https",
  "tcp",
  "tls",
  "tls_passthrough",
  "ws",
  "wss",
];

const DATA_STORE_SETTING_LABELS: Map<string, string> = new Map([
  ["name", "Project"],
  ["host", "Server hostname"],
  ["path", "Data path or bucket name"],
  ["port", "Port"],
  ["protocol", "Connection protocol"],
  ["minio_access_key", "S3 access key"],
  ["minio_secret_key", "S3 secret key"],
]);

/** Returns the display label of the first empty setting, or undefined when all are filled. */
export function findMissingSetting(
  settings: Record<string, unknown>,
): string | undefined {
  for (const key in settings) {
    if (!settings[key]) {
      return DATA_STORE_SETTING_LABELS.has(key)
        ? DATA_STORE_SETTING_LABELS.get(key)
        : key;
    }
  }
  return undefined;
}

export function normalizeDataStorePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export function toAvailableProjects(
  projectNodes: ProjectNode[],
): AvailableProject[] {
  return projectNodes.map((proj: ProjectNode) => ({
    name: proj.project?.display_name ?? proj.project?.name ?? proj.project_id,
    id: proj.project_id,
  }));
}

/** Sorts projects by name, placing unnamed projects last, without mutating the input. */
export function sortProjectsByName(
  projects: AvailableProject[],
): AvailableProject[] {
  return [...projects].sort((a, b) => {
    if (!a.name) return 1;
    if (!b.name) return -1;
    return a.name.localeCompare(b.name);
  });
}

/** Filters projects by a case-insensitive name or id match; an empty query returns them all. */
export function searchProjectsByName(
  projects: AvailableProject[],
  query: string,
): AvailableProject[] {
  const normalized = query.trim().toLowerCase();
  return normalized
    ? projects.filter((proj) =>
        (proj.name ?? proj.id).toLowerCase().includes(normalized),
      )
    : [...projects];
}
