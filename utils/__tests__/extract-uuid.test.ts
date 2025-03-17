import { expect, test } from "vitest";
import { extractUuid } from "../extract-uuid-from-kong-username";

test("Extract UUID from Kong name", () => {
  expect(
    extractUuid("97ed7bca-d56c-41b1-9625-61d20d90690c-fhir"),
  ).toStrictEqual(["fhir", "97ed7bca-d56c-41b1-9625-61d20d90690c"]);
});
