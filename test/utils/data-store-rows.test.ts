import { describe, expect, it } from "vitest";
import type { ModifiedDetailedService } from "~/services/modifiedApiInterfaces";
import { buildDataStoreRows } from "~/utils/data-store-rows";

const projectId = "5833b9b8-ad5c-4db4-a3d2-297517c74511";

function makeStore(
  overrides: Partial<ModifiedDetailedService> = {},
): ModifiedDetailedService {
  return {
    id: "store-1",
    name: "fhir-store",
    tags: ["type:fhir"],
    path: "/fhir",
    host: "blaze",
    port: 80,
    protocol: "http",
    created_at: 1741600000,
    updated_at: 1741700000,
    routes: [],
    ...overrides,
  } as unknown as ModifiedDetailedService;
}

describe("buildDataStoreRows", () => {
  it("returns no rows without stores", () => {
    expect(buildDataStoreRows(undefined, undefined)).toEqual([]);
    expect(buildDataStoreRows([], new Map())).toEqual([]);
  });

  it("keeps a single unlinked row for a store without routes", () => {
    const [row, ...rest] = buildDataStoreRows([makeStore()], new Map());

    expect(rest).toHaveLength(0);
    expect(row).toMatchObject({
      rowKey: "store-1",
      datastoreId: "store-1",
      name: "fhir-store",
      type: "fhir",
      project: "N/A",
      host: "blaze",
    });
    expect(row!.projectId).toBeUndefined();
    expect(row!.created_at?.timestamp).toBe(1741600000);
  });

  it("creates one row per linked project route", () => {
    const store = makeStore({
      routes: [
        { id: "route-1", tags: [`project:${projectId}`, "type:s3"] },
        { id: "route-2", tags: ["project:unknown-project"] },
      ],
    } as Partial<ModifiedDetailedService>);

    const rows = buildDataStoreRows(
      [store],
      new Map([[projectId, "use-case-1"]]),
    );

    expect(rows.map((row) => row.rowKey)).toEqual([
      "store-1:route-1",
      "store-1:route-2",
    ]);
    expect(rows[0]).toMatchObject({
      projectId,
      project: "use-case-1",
      type: "s3",
    });
    expect(rows[1]).toMatchObject({
      projectId: "unknown-project",
      project: "N/A",
      type: "fhir",
    });
  });

  it("falls back to the projectId parsed onto the route", () => {
    const store = makeStore({
      routes: [{ id: "route-1", tags: [], projectId }],
    } as unknown as Partial<ModifiedDetailedService>);

    const [row] = buildDataStoreRows(
      [store],
      new Map([[projectId, "use-case-1"]]),
    );

    expect(row).toMatchObject({ projectId, project: "use-case-1" });
  });
});
