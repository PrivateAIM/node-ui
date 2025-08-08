import KeycloakProvider from "next-auth/providers/keycloak";
import AuthentikProvider from "next-auth/providers/authentik";
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
  const idpProvider = process.env.NUXT_PUBLIC_IDP_PROVIDER;
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
