import KeycloakProvider from "next-auth/providers/keycloak";
import { NuxtAuthHandler } from "#auth";

export default NuxtAuthHandler({
  secret: useRuntimeConfig().sessionSecret,
  providers: [
    // @ts-expect-error Use .default here for it to work during SSR.
    KeycloakProvider.default({
      clientId: useRuntimeConfig().keycloakClientId,
      clientSecret: useRuntimeConfig().keycloakClientSecret,
      issuer: useRuntimeConfig().keycloakIssuerUrl,
    }),
  ],
  callbacks: {
    jwt: async ({ token, account }) => {
      if (account && account.access_token) {
        token.accessToken = account.access_token; // <-- adding the access_token here
        token.refreshToken = account.refresh_token;
      }

      return token;
    },
    async session({ session, token }) {
      session.token = token;

      return session;
    },
  },
});
