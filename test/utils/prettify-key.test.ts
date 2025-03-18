import { expect, test } from "vitest";
import { prettifyKey } from "~/utils/prettify-key";

test("Format the key", () => {
  expect(prettifyKey("foo_barword")).toBe("Foo Barword");
});
