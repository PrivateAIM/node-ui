/**
 * Derive the Hub's Authup account console link from the OIDC issuer the node UI signs in
 * with, e.g. "https://auth.privateaim.net/realms/my-realm".
 *
 * The issuer carries both the Authup base URL and the realm. Authup only lets a user log
 * in through a client of the user's own realm, so the issuer realm is also the realm of
 * the node's Hub client. The account console accepts the realm (id or name) as a
 * `realmId` hint and skips its realm chooser; the node UI origin rides along as `ref`,
 * which the account console renders as a back link when the origin is trusted.
 *
 * Returns undefined when the issuer does not have the Authup realm shape.
 */
export function buildHubAccountUrl(
  issuer: string | undefined,
  origin?: string,
): string | undefined {
  if (!issuer) return undefined;

  let url: URL;
  try {
    url = new URL(issuer);
  } catch {
    return undefined;
  }

  const match = url.pathname.match(/^(.*)\/realms\/([^/]+)\/?$/);
  if (!match) return undefined;

  const query = new URLSearchParams({
    realmId: decodeURIComponent(match[2] as string),
  });
  if (origin) query.set("ref", origin);

  return `${url.origin}${match[1]}/console/account?${query.toString()}`;
}
