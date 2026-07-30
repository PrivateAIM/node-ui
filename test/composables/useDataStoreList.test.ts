import { expect, test, describe } from "vitest";
import { buildProjectNameMap } from "~/composables/useDataStoreList";
import type { Project } from "~/services/hub";

describe("buildProjectNameMap", () => {
  test("maps project id to name", () => {
    const projects = [
      { id: "abc-123", displayName: "My Project" },
      { id: "def-456", displayName: "Other Project" },
    ];
    const map = buildProjectNameMap(projects as Project[]);
    expect(map.get("abc-123")).toBe("My Project");
    expect(map.get("def-456")).toBe("Other Project");
  });

  test("uses N/A when name is undefined", () => {
    const projects = [{ id: "abc-123", displayName: undefined }];
    const map = buildProjectNameMap(projects as Project[]);
    expect(map.get("abc-123")).toBe("N/A");
  });

  test("skips entries without id", () => {
    const projects = [{ id: undefined, displayName: "No ID" }];
    const map = buildProjectNameMap(projects as Project[]);
    expect(map.size).toBe(0);
  });

  test("returns empty map for empty array", () => {
    const map = buildProjectNameMap([]);
    expect(map.size).toBe(0);
  });
});
