import { createProxy } from "node-fetch-native/proxy";
import KeycloakProvider from "next-auth/providers/keycloak";
import AuthentikProvider from "next-auth/providers/authentik";
import OktaProvider from "next-auth/providers/okta";
import OneLoginProvider from "next-auth/providers/onelogin";
import ZitadelProvider from "next-auth/providers/zitadel";
import type { Account, Session, User } from "next-auth";
import type { Provider } from "next-auth/providers/index";
import type { JWT } from "next-auth/jwt";

import { NuxtAuthHandler } from "#auth";

function compileEndpoints() {
  const clientId = process.env.NUXT_IDP_CLIENT_ID ?? "node-ui";
  const clientSecret = process.env.NUXT_IDP_CLIENT_SECRET;
  const clientIssuer =
    process.env.NUXT_PUBLIC_IDP_ISSUER ?? "http://localhost:8080/realms/flame";
  const internalEndpoint =
    process.env.NUXT_PUBLIC_INTERNAL_KEYCLOAK_URL ?? clientIssuer;

  return {
    clientId: clientId,
    clientSecret: clientSecret,
    issuer: clientIssuer,
    wellKnown: undefined, // Overrides issuer
    jwks_endpoint: `${internalEndpoint}/protocol/openid-connect/certs`,
    authorization: {
      url: `${clientIssuer}/protocol/openid-connect/auth`,
    },
    token: {
      url: `${internalEndpoint}/protocol/openid-connect/token`,
    },
    userinfo: {
      url: `${internalEndpoint}/protocol/openid-connect/userinfo`,
    },
  };
}

function buildProvider() {
  const idpProvider = process.env.NUXT_PUBLIC_IDP_PROVIDER ?? "keycloak";
  const endPoints = compileEndpoints();
  const clientIssuer =
    process.env.NUXT_PUBLIC_IDP_ISSUER ?? "http://localhost:8080/realms/flame";

  const providers: Provider[] = [];

  switch (idpProvider) {
    case "keycloak": {
      const keycloakProvider =
        // Use .default here for it to work during SSR.
        // @ts-expect-error default is an option
        KeycloakProvider.default({
          ...endPoints,
        });
      providers.push(keycloakProvider);
      break;
    }

    case "authentik": {
      const authentikProvider =
        // @ts-expect-error default is an option
        AuthentikProvider.default({
          ...endPoints,
        });
      providers.push(authentikProvider);
      break;
    }

    case "hub": {
      const clientId = process.env.NUXT_IDP_CLIENT_ID ?? "node-ui";
      const clientSecret = process.env.NUXT_IDP_CLIENT_SECRET;
      const hubProvider = {
        id: "hub",
        name: "Hub",
        type: "oauth",
        idToken: false,
        clientId: clientId,
        clientSecret: clientSecret,
        wellKnown: `${clientIssuer}/.well-known/openid-configuration`,
        checks: ["state"],
        authorization: {
          params: {
            scope: "global",
          },
        },
        profile(profile: {
          id: string;
          name: string | undefined;
          first_name: string | undefined;
          last_name: string | undefined;
          display_name: string | undefined;
        }) {
          return {
            id: profile.id,
            name: profile.name ?? profile.display_name,
          };
        },
      };
      providers.push(hubProvider as Provider);
      break;
    }

    case "auth0": {
      const auth0Provider =
        // @ts-expect-error default is an option
        Auth0.default({
          ...endPoints,
        });
      providers.push(auth0Provider);
      break;
    }

    case "onelogin": {
      const oneLoginProvider =
        // @ts-expect-error default is an option
        OneLoginProvider.default({
          ...endPoints,
        });
      providers.push(oneLoginProvider);
      break;
    }

    case "okta": {
      const oktaProvider =
        // @ts-expect-error default is an option
        OktaProvider.default({
          ...endPoints,
        });
      providers.push(oktaProvider);
      break;
    }

    case "zitadel": {
      const zitadelProvider =
        // @ts-expect-error default is an option
        ZitadelProvider.default({
          ...endPoints,
        });
      providers.push(zitadelProvider);
      break;
    }
  }

  return providers;
}

const REFRESH_BUFFER_SECONDS = 120;
const REFRESH_RESULT_TTL_MS = 10_000;
// Need to track them for edge cases
const activeRefreshes = new Map<string, Promise<JWT>>();

let tokenEndpointPromise: Promise<string> | undefined;

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

function jwtExpiry(accessToken: unknown): number | undefined {
  if (typeof accessToken !== "string") return undefined;
  try {
    const payload = JSON.parse(
      Buffer.from(accessToken.split(".")[1] ?? "", "base64url").toString(),
    );
    return typeof payload.exp === "number" ? payload.exp : undefined;
  } catch {
    return undefined;
  }
}

function getTokenEndpoint(issuer: string, proxy: RequestInit) {
  tokenEndpointPromise ??= fetch(
    `${issuer}/.well-known/openid-configuration`,
    proxy,
  )
    .then(async (r) => {
      if (!r.ok) throw new Error(`OIDC discovery failed with ${r.status}`);
      return (await r.json()).token_endpoint as string;
    })
    .catch((error) => {
      tokenEndpointPromise = undefined;
      throw error;
    });
  return tokenEndpointPromise;
}

// stop parallel requests from using the same refresh token
function refreshAccessTokenOnce(token: JWT) {
  const key = token.refresh_token as string;
  let refresh = activeRefreshes.get(key);
  if (!refresh) {
    refresh = refreshAccessToken(token);
    activeRefreshes.set(key, refresh);
    refresh
      .catch(() => undefined)
      .finally(() =>
        setTimeout(() => activeRefreshes.delete(key), REFRESH_RESULT_TTL_MS),
      );
  }
  return refresh;
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
  const clientId = process.env.NUXT_IDP_CLIENT_ID ?? "node-ui";
  const clientSecret = process.env.NUXT_IDP_CLIENT_SECRET ?? "";
  const clientIssuer =
    process.env.NUXT_PUBLIC_IDP_ISSUER ?? "http://localhost:8080/realms/flame";

  const proxy = createProxy();

  const tokenEndpoint = await getTokenEndpoint(
    clientIssuer,
    proxy as RequestInit,
  );

  const response = await fetch(tokenEndpoint, {
    ...(proxy as RequestInit),
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    method: "POST",
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: token.refresh_token as string,
    }),
  });

  const refreshedTokens = await response.json();

  if (!response.ok) throw refreshedTokens;

  return {
    ...token,
    access_token: refreshedTokens.access_token,
    expires_at:
      typeof refreshedTokens.expires_in === "number"
        ? nowSeconds() + refreshedTokens.expires_in
        : jwtExpiry(refreshedTokens.access_token),
    refresh_token: refreshedTokens.refresh_token ?? token.refresh_token,
    error: undefined,
  };
}

export default NuxtAuthHandler({
  secret: useRuntimeConfig().authSecret as string | undefined,
  events: {
    async signIn({ account }: { account: Account | null }) {
      // After successful sign in
      const hubAdapterApi = process.env.NUXT_PUBLIC_HUB_ADAPTER_URL;
      if (!hubAdapterApi || !account?.access_token) return;
      const signInEndpoint = `${hubAdapterApi.replace(/\/$/, "")}/events/signin`;
      try {
        await fetch(signInEndpoint, {
          ...(createProxy() as RequestInit),
          headers: { Authorization: `Bearer ${account.access_token}` },
          method: "POST",
        });
      } catch (error) {
        console.error("Failed to log sign-in event:", error);
      }
    },
    async signOut({ token }: { session: Session; token: JWT }) {
      // After successful sign out
      const hubAdapterApi = process.env.NUXT_PUBLIC_HUB_ADAPTER_URL;
      if (!hubAdapterApi || !token?.access_token) return;
      const signOutEndpoint = `${hubAdapterApi.replace(/\/$/, "")}/events/signout`;
      try {
        await fetch(signOutEndpoint, {
          ...(createProxy() as RequestInit),
          headers: { Authorization: `Bearer ${token.access_token}` },
          method: "POST",
        });
      } catch (error) {
        console.error("Failed to log sign-out event:", error);
      }
    },
  },
  callbacks: {
    /* on session retrieval */
    async session({ session, token }: { session: Session; token: JWT }) {
      return {
        ...session,
        accessToken: token.access_token as string | undefined,
        expiresAt: token.expires_at as number | undefined,
        error: token.error as string | undefined,
      };
    },
    /* on JWT token creation or mutation */
    async jwt({
      token,
      account,
      user,
    }: {
      token: JWT;
      account?: Account | null;
      user?: User;
    }) {
      if (account && user) {
        if (account.type === "credentials") {
          const u = user as {
            access_token?: string;
            refresh_token?: string;
            expires_at?: number;
          };
          return {
            ...token,
            access_token: u.access_token,
            expires_at: u.expires_at,
            refresh_token: u.refresh_token,
          };
        }
        return {
          ...token,
          access_token: account.access_token,
          expires_at: account.expires_at ?? jwtExpiry(account.access_token),
          refresh_token: account.refresh_token,
        };
      }

      const expiresAt = token.expires_at as number | undefined;
      if (!expiresAt || nowSeconds() < expiresAt - REFRESH_BUFFER_SECONDS) {
        return token;
      }

      if (!token.refresh_token) {
        return { ...token, error: "RefreshAccessTokenError" };
      }
      try {
        return await refreshAccessTokenOnce(token);
      } catch (error) {
        console.error("Error refreshing access_token", error);
        // If we fail to refresh the token, return an error so we can handle it on the page
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }
    },
  },
  providers: buildProvider(),
});
