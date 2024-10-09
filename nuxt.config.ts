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
          process.env.NUXT_OIDC_PROVIDERS_KEYCLOAK_REDIRECT_URI ||
          process.env.NUXT_PUBLIC_BASE_URL + "/auth/keycloak/callback",
        authorizationUrl:
          process.env.NUXT_OIDC_PROVIDERS_KEYCLOAK_AUTHORIZATION_URL ||
          process.env.KEYCLOAK_LOGIN_URL +
            "/realms/flame/protocol/openid-connect/auth",
        tokenUrl:
          process.env.NUXT_OIDC_PROVIDERS_KEYCLOAK_TOKEN_URL ||
          process.env.KEYCLOAK_SERVICE_URL +
            "/realms/flame/protocol/openid-connect/auth",
        userinfoUrl:
          process.env.NUXT_OIDC_PROVIDERS_KEYCLOAK_USERINFO_URL ||
          process.env.KEYCLOAK_SERVICE_URL +
            "/realms/flame/protocol/openid-connect/auth",
        openIdConfiguration:
          process.env.NUXT_OIDC_PROVIDERS_KEYCLOAK_OPEN_ID_CONFIGURATION ||
          process.env.KEYCLOAK_SERVICE_URL +
            "/realms/flame/.well-known/openid-configuration",
        logoutUrl:
          process.env.NUXT_OIDC_PROVIDERS_KEYCLOAK_LOGOUT_URL ||
          process.env.KEYCLOAK_SERVICE_URL +
            "/realms/flame/protocol/openid-connect/logout",
        logoutRedirectUri: process.env.NUXT_PUBLIC_BASE_URL,
        exposeAccessToken: true,
        pkce: false,
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
    "@/assets/css/table.css",
    "@/assets/css/card.css",
  ],

  compatibilityDate: "2024-09-30",
});
