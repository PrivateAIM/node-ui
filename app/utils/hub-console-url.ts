export type HubConsoleLinks = {
  admin: string;
  account: string;
};

/**
 * Derive the Hub's Authup console links from the OIDC issuer the node UI signs in with,
 * e.g. "https://auth.privateaim.net/realms/my-realm".
 *
 * The issuer carries both the Authup base URL and the realm. Authup only lets a user log
 * in through a client of the user's own realm, so the issuer realm is also the realm of
 * the node's Hub client. The account console accepts the realm (id or name) as a
 * `realmId` hint and skips its realm chooser; the node UI origin rides along as `ref`,
 * which the account console renders as a back link when the origin is trusted.
 *
 * Returns undefined when the issuer does not have the Authup realm shape.
 */
export function buildHubConsoleLinks(
  issuer: string | undefined,
  origin?: string,
): HubConsoleLinks | undefined {
  if (!issuer) return undefined;

  let url: URL;
  try {
    url = new URL(issuer);
  } catch {
    return undefined;
  }

  const match = url.pathname.match(/^(.*)\/realms\/([^/]+)\/?$/);
  if (!match) return undefined;

  const base = `${url.origin}${match[1]}`;
  const realm = match[2] as string;

  const query = new URLSearchParams({ realmId: decodeURIComponent(realm) });
  if (origin) query.set("ref", origin);

  return {
    admin: `${base}/console/admin`,
    account: `${base}/console/account?${query.toString()}`,
  };
}
