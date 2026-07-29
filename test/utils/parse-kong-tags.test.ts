import { expect, test } from "vitest";
import { parseKongTags } from "~/utils/parse-kong-tags";

test("Parse relationship tags from a Kong entity", () => {
  expect(
    parseKongTags([
      "project:97ed7bca-d56c-41b1-9625-61d20d90690c",
      "datastore:2ad18d4d-395a-49f3-a553-981a02f52422",
      "type:fhir",
    ]),
  ).toStrictEqual({
    project: "97ed7bca-d56c-41b1-9625-61d20d90690c",
    datastore: "2ad18d4d-395a-49f3-a553-981a02f52422",
    type: "fhir",
  });
});

test("Skip valueless tags", () => {
  expect(
    parseKongTags(["health", "project:97ed7bca-d56c-41b1-9625-61d20d90690c"]),
  ).toStrictEqual({
    project: "97ed7bca-d56c-41b1-9625-61d20d90690c",
  });
});

test("Handle missing tags", () => {
  expect(parseKongTags(undefined)).toStrictEqual({});
  expect(parseKongTags(null)).toStrictEqual({});
  expect(parseKongTags([])).toStrictEqual({});
});
