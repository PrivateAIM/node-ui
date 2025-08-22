import KeycloakProvider from "next-auth/providers/keycloak";
import AuthentikProvider from "next-auth/providers/authentik";
import OktaProvider from "next-auth/providers/okta";
import OneLoginProvider from "next-auth/providers/onelogin";
import ZitadelProvider from "next-auth/providers/zitadel";

import { NuxtAuthHandler } from "#auth";

function compileEndpoints() {
  if (process.env.NUXT_K8S_KEYCLOAK_ENDPOINT) {
    return {
      jwks_endpoint: `${process.env.NUXT_K8S_KEYCLOAK_ENDPOINT}/protocol/openid-connect/certs`,
      wellKnown: undefined,
      authorization: `${process.env.NUXT_PUBLIC_IDP_PROVIDER}/protocol/openid-connect/auth`,
      token: `${process.env.NUXT_K8S_KEYCLOAK_ENDPOINT}/protocol/openid-connect/token`,
      userinfo: `${process.env.NUXT_K8S_KEYCLOAK_ENDPOINT}/protocol/openid-connect/userinfo`,
    };
  }
}

function buildProvider() {
  const idpProvider = process.env.NUXT_PUBLIC_IDP_PROVIDER ?? "keycloak";
  const clientId = process.env.NUXT_IDP_CLIENT_ID ?? "node-ui";
  const clientSecret = process.env.NUXT_IDP_CLIENT_SECRET;
  const clientIssuer =
    process.env.NUXT_PUBLIC_IDP_ISSUER ?? "http://localhost:8080/realms/flame";

  const providers = [];

  switch (idpProvider) {
    case "keycloak": {
      const keycloakProvider =
        // Use .default here for it to work during SSR.
        // @ts-expect-error default is an option
        KeycloakProvider.default({
          clientId: clientId,
          clientSecret: clientSecret,
          issuer: clientIssuer,
          ...endPoints,
        });
      providers.push(keycloakProvider);
      break;
    }

    case "authentik": {
      const authentikProvider =
        // @ts-expect-error default is an option
        AuthentikProvider.default({
          clientId: clientId,
          clientSecret: clientSecret,
          issuer: clientIssuer,
        });
      providers.push(authentikProvider);
      break;
    }

    case "auth0": {
      const auth0Provider =
        // @ts-expect-error default is an option
        Auth0.default({
          clientId: clientId,
          clientSecret: clientSecret,
          issuer: clientIssuer,
        });
      providers.push(auth0Provider);
      break;
    }

    case "onelogin": {
      const oneLoginProvider =
        // @ts-expect-error default is an option
        OneLoginProvider.default({
          clientId: clientId,
          clientSecret: clientSecret,
          issuer: clientIssuer,
        });
      providers.push(oneLoginProvider);
      break;
    }

    case "okta": {
      const oktaProvider =
        // @ts-expect-error default is an option
        OktaProvider.default({
          clientId: clientId,
          clientSecret: clientSecret,
          issuer: clientIssuer,
        });
      providers.push(oktaProvider);
      break;
    }

    case "zitadel": {
      const zitadelProvider =
        // @ts-expect-error default is an option
        ZitadelProvider.default({
          clientId: clientId,
          clientSecret: clientSecret,
          issuer: clientIssuer,
        });
      providers.push(zitadelProvider);
      break;
    }
  }

  return providers;
}

const endPoints = compileEndpoints();

export default NuxtAuthHandler({
  // A secret string you define, to ensure correct encryption
  secret: useRuntimeConfig().authSecret,
  callbacks: {
    /* on session retrieval */
    async session({ session, token }) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      session.accessToken = token.accessToken;
      return session;
    },
    /* on JWT token creation or mutation */
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
  providers: buildProvider(),
});
