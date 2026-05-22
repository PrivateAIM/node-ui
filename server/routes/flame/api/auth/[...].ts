import { createProxy } from "node-fetch-native/proxy";
import KeycloakProvider from "next-auth/providers/keycloak";
import AuthentikProvider from "next-auth/providers/authentik";
import OktaProvider from "next-auth/providers/okta";
import OneLoginProvider from "next-auth/providers/onelogin";
import ZitadelProvider from "next-auth/providers/zitadel";
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

  const providers = [];

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
      providers.push(hubProvider);
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

async function refreshAccessToken(token: JWT) {
  const clientId = process.env.NUXT_IDP_CLIENT_ID ?? "node-ui";
  const clientSecret = process.env.NUXT_IDP_CLIENT_SECRET ?? "";
  const clientIssuer =
    process.env.NUXT_PUBLIC_IDP_ISSUER ?? "http://localhost:8080/realms/flame";

  const proxy = createProxy();

  const discovery = await fetch(
    `${clientIssuer}/.well-known/openid-configuration`,
    { ...proxy },
  ).then((r) => r.json());
  const tokenEndpoint: string = discovery.token_endpoint;

  const response = await fetch(tokenEndpoint, {
    ...proxy,
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
    expires_at: Date.now() + refreshedTokens.expires_in * 1000,
    refresh_token: refreshedTokens.refresh_token ?? token.refresh_token,
  };
}

export default NuxtAuthHandler({
  secret: useRuntimeConfig().authSecret,
  events: {
    async signIn({ account }) {
      // After successful sign in
      const hubAdapterApi = process.env.NUXT_PUBLIC_HUB_ADAPTER_URL;
      if (!hubAdapterApi || !account?.access_token) return;
      const signInEndpoint = `${hubAdapterApi.replace(/\/$/, "")}/events/signin`;
      try {
        await fetch(signInEndpoint, {
          headers: { Authorization: `Bearer ${account.access_token}` },
          method: "POST",
        });
      } catch (error) {
        console.error("Failed to log sign-in event:", error);
      }
    },
    async signOut({ token }) {
      // After successful sign out
      const hubAdapterApi = process.env.NUXT_PUBLIC_HUB_ADAPTER_URL;
      if (!hubAdapterApi || !token?.access_token) return;
      const signOutEndpoint = `${hubAdapterApi.replace(/\/$/, "")}/events/signout`;
      try {
        await fetch(signOutEndpoint, {
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
    async session({ session, token }) {
      return {
        ...session,
        accessToken: token.access_token,
        expiresAt: token.expires_at,
      };
    },
    /* on JWT token creation or mutation */
    async jwt({ token, account, user }) {
      if (account && user) {
        if (account.type === "credentials") {
          // CredentialsProvider (Hub password grant): tokens live on the user object
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
          expires_at: account.expires_at as number,
          refresh_token: account.refresh_token,
        };
      }
      if (Date.now() < (token.expires_at as number)) {
        // Subsequent logins, but the `access_token` is still valid
        return token;
      }

      if (!token.refresh_token) throw new TypeError("Missing refresh_token");
      try {
        return refreshAccessToken(token);
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
