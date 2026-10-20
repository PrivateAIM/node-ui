import { describe, expect, test } from "vitest";
import { buildHubAccountUrl } from "~/utils/hub-console-url";

describe("buildHubAccountUrl", () => {
  test("derives the account console link and realm from the issuer", () => {
    expect(
      buildHubAccountUrl(
        "https://auth.privateaim.net/realms/my-realm",
        "https://node.example.org",
      ),
    ).toBe(
      "https://auth.privateaim.net/console/account?realmId=my-realm&ref=https%3A%2F%2Fnode.example.org",
    );
  });

  test("keeps a sub-path deployment and a trailing slash", () => {
    expect(buildHubAccountUrl("https://example.org/auth/realms/master/")).toBe(
      "https://example.org/auth/console/account?realmId=master",
    );
  });

  test.each([
    undefined,
    "",
    "not a url",
    "https://auth.privateaim.net",
    "javascript:/realms/master",
    "https://auth.privateaim.net/realms/%ZZ",
  ])(
    "returns undefined for %s",
    (issuer) => {
      expect(buildHubAccountUrl(issuer)).toBeUndefined();
    },
  );
});
