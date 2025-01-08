import KeycloakProvider from "next-auth/providers/keycloak";
import { NuxtAuthHandler } from "#auth";

export default NuxtAuthHandler({
  // A secret string you define, to ensure correct encryption
  secret: "zum/AAaAkehcW3seRfTK3PPJnpWiRSs8dmheTAQT7nQ=",
  providers: [
    // @ts-expect-error Use .default here for it to work during SSR.
    KeycloakProvider.default({
      clientId: "node-ui",
      clientSecret: "bb7pb70seoOjQOtJittODYegCBXc8paC",
      issuer: "http://localhost:8080/realms/flame",
    }),
  ],
});
