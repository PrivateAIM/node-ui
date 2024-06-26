// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  ssr: true,
  modules: ["nuxt-primevue", "nuxt-oidc-auth"],
  runtimeConfig: {
    public: {
      baseURL: process.env.HUB_ADAPTER_API_URL || "http://localhost:5000/",
      keycloakUrl: process.env.KEYCLOAK_URL || "http://localhost:8080",
      keycloakRealm: process.env.KEYCLOAK_REALM || "flame",
      keycloakClientId: process.env.KEYCLOAK_CLIENT_ID || "node-ui",
      keycloakClientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
    },
  },
  primevue: {
    options: {
      ripple: true,
    },
    directives: {
      include: ["Ripple", "Tooltip", "Toast"],
    },
  },
  oidc: {
    defaultProvider: "keycloak",
    providers: {
      keycloak: {
        tokenRequestType: "form-urlencoded",
        clientId:
          process.env.NUXT_OIDC_PROVIDERS_KEYCLOAK_CLIENT_ID || "node-ui",
        clientSecret:
          process.env.NUXT_OIDC_PROVIDERS_KEYCLOAK_CLIENT_SECRET || "",
        baseUrl:
          process.env.NUXT_OIDC_PROVIDERS_KEYCLOAK_BASE_URL ||
          "http://localhost:8080",
        redirectUri: process.env.BASE_URL + "/auth/keycloak/callback",
        exposeAccessToken: true,
      },
    },
    session: {
      expirationCheck: false,
      automaticRefresh: false,
      maxAge: 3600,
    },
    middleware: {
      globalMiddlewareEnabled: false,
      customLoginPage: false,
    },
  },
  css: [
    "primevue/resources/themes/lara-dark-amber/theme.css",
    "primeicons/primeicons.css",
  ],
});
