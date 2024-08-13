// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: false },
  modules: ["nuxt-primevue", "nuxt-oidc-auth"],

  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || "http://localhost:3000",
      hubAdapterUrl:
        process.env.NUXT_PUBLIC_HUB_ADAPTER_URL || "http://localhost:5000",
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
        clientId:
          process.env.NUXT_OIDC_PROVIDERS_KEYCLOAK_CLIENT_ID || "node-ui",
        clientSecret: process.env
          .NUXT_OIDC_PROVIDERS_KEYCLOAK_CLIENT_SECRET as string,
        redirectUri:
          process.env.NUXT_PUBLIC_BASE_URL + "/auth/keycloak/callback",
        exposeAccessToken: true,
        // The auth is different since that is accessed via a frontend client
        authorizationUrl:
          process.env.KEYCLOAK_LOGIN_URL + "/protocol/openid-connect/auth",
        tokenUrl:
          process.env.KEYCLOAK_SERVICE_URL + "/protocol/openid-connect/token",
        userinfoUrl:
          process.env.KEYCLOAK_SERVICE_URL +
          "/protocol/openid-connect/userinfo",
        logoutUrl:
          process.env.KEYCLOAK_SERVICE_URL + "/protocol/openid-connect/logout",
      },
    },
    session: {
      expirationCheck: false,
      automaticRefresh: true,
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

  compatibilityDate: "2024-07-29",
});
