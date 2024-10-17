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
        audience: "account",
        userNameClaim: "preferred_username",
        clientId: "",
        clientSecret: "",
        redirectUri: "",
        authorizationUrl: "",
        tokenUrl: "",
        userinfoUrl: "",
        openIdConfiguration: "",
        logoutUrl: "",
        logoutRedirectUri: "",
        validateAccessToken: false,
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
