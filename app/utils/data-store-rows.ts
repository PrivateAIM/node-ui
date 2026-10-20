import type { Route } from "~/services/Api";
import type { ModifiedDetailedService } from "~/services/modifiedApiInterfaces";
import type { DetailedDataStoreTableRow } from "~/types/dataStore";
import { parseUnixTimestamp } from "~/utils/format-data-row";
import { parseKongTags } from "~/utils/parse-kong-tags";

/** Flattens data stores into one table row per linked project route, or one row if unlinked. */
export function buildDataStoreRows(
  stores: ModifiedDetailedService[] | undefined,
  projectNameMap: Map<string, string | undefined> | undefined,
): DetailedDataStoreTableRow[] {
  const tableRows: DetailedDataStoreTableRow[] = [];

  if (stores && stores.length > 0) {
    stores.forEach((store: ModifiedDetailedService) => {
      const formattedRow = parseUnixTimestamp(store, [
        "created_at",
        "updated_at",
      ]) as ModifiedDetailedService;
      const baseRow: DetailedDataStoreTableRow = {
        rowKey: store.id!,
        datastoreId: store.id ?? undefined,
        name: store.name,
        type: parseKongTags(store.tags).type,
        project: "N/A",
        path: store.path,
        host: store.host,
        port: store.port,
        protocol: store.protocol,
        created_at: formattedRow.created_at,
        updated_at: formattedRow.updated_at,
      };
      const routes = store.routes;
      if (routes && routes.length > 0) {
        routes.forEach((route: Route) => {
          const routeTags = parseKongTags(route.tags);
          const projectUuid = routeTags.project ?? route["projectId"];
          tableRows.push({
            ...baseRow,
            rowKey: `${store.id}:${route.id}`,
            projectId: projectUuid,
            type: routeTags.type ?? baseRow.type,
            project:
              projectUuid && projectNameMap?.has(projectUuid)
                ? projectNameMap.get(projectUuid)!
                : "N/A",
          });
        });
      } else {
        // Data stores can now exist without any linked project
        tableRows.push(baseRow);
      }
    });
  }

  return tableRows;
}
