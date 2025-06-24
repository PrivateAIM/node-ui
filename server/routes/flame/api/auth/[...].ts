import KeycloakProvider from "next-auth/providers/keycloak";
import { NuxtAuthHandler } from "#auth";

function compileEndpoints() {
  if (process.env.NUXT_K8S_KEYCLOAK_ENDPOINT) {
    return {
      jwks_endpoint: `${process.env.NUXT_K8S_KEYCLOAK_ENDPOINT}/protocol/openid-connect/certs`,
      wellKnown: undefined,
      authorization: `${process.env.NUXT_PUBLIC_KEYCLOAK_BASE_URL}/protocol/openid-connect/auth`,
      token: `${process.env.NUXT_K8S_KEYCLOAK_ENDPOINT}/protocol/openid-connect/token`,
      userinfo: `${process.env.NUXT_K8S_KEYCLOAK_ENDPOINT}/protocol/openid-connect/userinfo`,
    };
  }
}

const endPoints = compileEndpoints();

export default NuxtAuthHandler({
  // A secret string you define, to ensure correct encryption
  secret: useRuntimeConfig().authSecret,
  callbacks: {
    /* on session retrival */
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
  providers: [
    // Use .default here for it to work during SSR.
    KeycloakProvider.default({
      clientId: process.env.NUXT_KEYCLOAK_CLIENT_ID ?? "node-ui",
      clientSecret: process.env.NUXT_KEYCLOAK_CLIENT_SECRET,
      issuer:
        process.env.NUXT_PUBLIC_KEYCLOAK_BASE_URL ??
        "http://localhost:8080/realms/flame",
      // checks: ["none"],
      ...endPoints,
    }),
  ],
});
