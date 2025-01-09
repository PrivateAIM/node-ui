import KeycloakProvider from "next-auth/providers/keycloak";
import { NuxtAuthHandler } from "#auth";

export default NuxtAuthHandler({
  // A secret string you define, to ensure correct encryption
  secret: useRuntimeConfig().authSecret,
  providers: [
    // @ts-expect-error Use .default here for it to work during SSR.
    KeycloakProvider.default({
      clientId: useRuntimeConfig().keycloakClientId ?? "node-ui",
      clientSecret: useRuntimeConfig().keycloakClientSecret,
      issuer:
        process.env.KEYCLOAK_BASE_URL ?? "http://localhost:8080/realms/flame",
    }),
  ],
});
