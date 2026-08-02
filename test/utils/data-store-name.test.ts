import { afterEach, describe, expect, test, vi } from "vitest";
import {
  generateDataStoreName,
  generateRandomDataStoreName,
  isValidDataStoreName,
} from "~/utils/data-store-name";

describe("isValidDataStoreName", () => {
  test("accepts URL-safe names", () => {
    expect(isValidDataStoreName("my-data.store_1~x")).toBe(true);
  });

  test("rejects names with invalid characters", () => {
    expect(isValidDataStoreName("my data store")).toBe(false);
    expect(isValidDataStoreName("store/1")).toBe(false);
    expect(isValidDataStoreName("")).toBe(false);
  });

  test("rejects bare UUIDs", () => {
    expect(isValidDataStoreName("97ed7bca-d56c-41b1-9625-61d20d90690c")).toBe(
      false,
    );
  });
});

describe("generateDataStoreName", () => {
  test("keeps already valid names", () => {
    expect(generateDataStoreName("my-fake-project-1")).toBe(
      "my-fake-project-1",
    );
  });

  test("replaces invalid characters", () => {
    expect(generateDataStoreName("My Fancy Project!")).toBe("My-Fancy-Project");
  });

  test("suffixes bare UUIDs", () => {
    expect(generateDataStoreName("97ed7bca-d56c-41b1-9625-61d20d90690c")).toBe(
      "97ed7bca-d56c-41b1-9625-61d20d90690c-datastore",
    );
  });

  test("falls back for empty names", () => {
    expect(generateDataStoreName("  ")).toBe("datastore");
  });
});

describe("generateRandomDataStoreName", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("prefixes the sanitized project name and appends an adjective-noun pair with a hex suffix", () => {
    expect(generateRandomDataStoreName("My Fancy Project!")).toMatch(
      /^My-Fancy-Project-[a-z]+-[a-z]+-[0-9a-f]{4}$/,
    );
  });

  test("is deterministic for a fixed random source", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const first = generateRandomDataStoreName("proj");
    const second = generateRandomDataStoreName("proj");
    expect(first).toBe(second);
    expect(first).toMatch(/^proj-[a-z]+-[a-z]+-[0-9a-f]{4}$/);
  });

  test("varies with the random source", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0);
    const first = generateRandomDataStoreName("proj");
    spy.mockReturnValue(0.999);
    const second = generateRandomDataStoreName("proj");
    expect(first).not.toBe(second);
  });

  test("always produces valid names, even for hostile project names", () => {
    for (const projectName of [
      "  ",
      "97ed7bca-d56c-41b1-9625-61d20d90690c",
      "spaces and / slashes",
    ]) {
      for (let i = 0; i < 20; i++) {
        expect(
          isValidDataStoreName(generateRandomDataStoreName(projectName)),
        ).toBe(true);
      }
    }
  });
});
