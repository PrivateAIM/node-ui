import { describe, expect, test } from "vitest";
import { buildHubConsoleLinks } from "~/utils/hub-console-url";

describe("buildHubConsoleLinks", () => {
  test("derives the console links and realm from the issuer", () => {
    expect(
      buildHubConsoleLinks(
        "https://auth.privateaim.net/realms/my-realm",
        "https://node.example.org",
      ),
    ).toEqual({
      admin: "https://auth.privateaim.net/console/admin",
      account:
        "https://auth.privateaim.net/console/account?realmId=my-realm&ref=https%3A%2F%2Fnode.example.org",
    });
  });

  test("keeps a sub-path deployment and a trailing slash", () => {
    expect(
      buildHubConsoleLinks("https://example.org/auth/realms/master/"),
    ).toEqual({
      admin: "https://example.org/auth/console/admin",
      account: "https://example.org/auth/console/account?realmId=master",
    });
  });

  test.each([undefined, "", "not a url", "https://auth.privateaim.net"])(
    "returns undefined for %s",
    (issuer) => {
      expect(buildHubConsoleLinks(issuer)).toBeUndefined();
    },
  );
});
