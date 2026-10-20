import { describe, expect, it } from "vitest";
import type { ProjectNode } from "~/services/Api";
import {
  findMissingSetting,
  normalizeDataStorePath,
  searchProjectsByName,
  sortProjectsByName,
  toAvailableProjects,
} from "~/utils/data-store-form";

describe("findMissingSetting", () => {
  it("returns undefined when every setting is filled", () => {
    expect(findMissingSetting({ name: "ds", port: 80 })).toBeUndefined();
  });

  it("returns the label of the first empty setting", () => {
    expect(findMissingSetting({ name: "ds", host: "", path: "" })).toBe(
      "Server hostname",
    );
  });

  it("falls back to the key for unlabelled settings", () => {
    expect(findMissingSetting({ s3_access_key: "" })).toBe("s3_access_key");
  });
});

describe("normalizeDataStorePath", () => {
  it("prefixes a missing leading slash", () => {
    expect(normalizeDataStorePath("bucket")).toBe("/bucket");
    expect(normalizeDataStorePath("/data")).toBe("/data");
  });
});

describe("project options", () => {
  const projects = [
    { id: "b", name: "beta" },
    { id: "n", name: null },
    { id: "a", name: "Alpha" },
  ];

  it("maps project nodes to options, preferring the display name", () => {
    const nodes = [
      { projectId: "1", project: { displayName: "Display", name: "name" } },
      { projectId: "2", project: { name: "name-only" } },
      { projectId: "3" },
    ] as unknown as ProjectNode[];

    expect(toAvailableProjects(nodes)).toEqual([
      { id: "1", name: "Display" },
      { id: "2", name: "name-only" },
      { id: "3", name: "3" },
    ]);
  });

  it("sorts by name with unnamed projects last, without mutating", () => {
    const sorted = sortProjectsByName(projects);

    expect(sorted.map((proj) => proj.id)).toEqual(["a", "b", "n"]);
    expect(projects.map((proj) => proj.id)).toEqual(["b", "n", "a"]);
  });

  it("searches names and ids case-insensitively", () => {
    expect(searchProjectsByName(projects, " ALP ")).toEqual([projects[2]]);
    expect(searchProjectsByName(projects, "n")).toEqual([projects[1]]);
    expect(searchProjectsByName(projects, "")).toEqual(projects);
  });
});
