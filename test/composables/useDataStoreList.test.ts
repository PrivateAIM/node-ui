import { expect, test, describe } from "vitest";
import {
  buildProjectNameMap,
  extractProjectIdFromPath,
} from "~/composables/useDataStoreList";

describe("buildProjectNameMap", () => {
  test("maps project id to name", () => {
    const projects = [
      { id: "abc-123", display_name: "My Project" },
      { id: "def-456", display_name: "Other Project" },
    ];
    const map = buildProjectNameMap(projects as any);
    expect(map.get("abc-123")).toBe("My Project");
    expect(map.get("def-456")).toBe("Other Project");
  });

  test("uses N/A when name is undefined", () => {
    const projects = [{ id: "abc-123", display_name: undefined }];
    const map = buildProjectNameMap(projects as any);
    expect(map.get("abc-123")).toBe("N/A");
  });

  test("skips entries without id", () => {
    const projects = [{ id: undefined, display_name: "No ID" }];
    const map = buildProjectNameMap(projects as any);
    expect(map.size).toBe(0);
  });

  test("returns empty map for empty array", () => {
    const map = buildProjectNameMap([]);
    expect(map.size).toBe(0);
  });
});

describe("extractProjectIdFromPath", () => {
  test("extracts the second path segment", () => {
    expect(extractProjectIdFromPath(["/abc-123/data"])).toBe("abc-123");
  });

  test("works with uuid-style ids", () => {
    expect(
      extractProjectIdFromPath(["/97ed7bca-d56c-41b1-9625-61d20d90690c/fhir"]),
    ).toBe("97ed7bca-d56c-41b1-9625-61d20d90690c");
  });
});
