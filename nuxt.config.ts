// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: false },
  modules: ["nuxt-primevue", "@sidebase/nuxt-auth"],

  runtimeConfig: {
    sessionSecret: process.env.NUXT_SESSION_SECRET,
    keycloakClientId: process.env.NUXT_KEYCLOAK_CLIENT_ID,
    keycloakClientSecret: process.env.NUXT_KEYCLOAK_CLIENT_SECRET,
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || "http://localhost:3000",
      hubAdapterUrl:
        process.env.NUXT_PUBLIC_HUB_ADAPTER_URL || "http://localhost:5000",
      keycloakIssuerUrl: process.env.NUXT_KEYCLOAK_ISSUER_URL,
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

  auth: {
    isEnabled: true,
    disableServerSideAuth: false,
    // baseURL: "http://localhost:3000",
    provider: {
      type: "authjs",
      trustHost: false,
      defaultProvider: "keycloak",
      addDefaultCallbackUrl: "/",
    },
    sessionRefresh: {
      enablePeriodically: true,
      enableOnWindowFocus: true,
    },
    globalAppMiddleware: false,
  },

  css: [
    "primevue/resources/themes/lara-dark-amber/theme.css",
    "primeicons/primeicons.css",
  ],

  compatibilityDate: "2024-07-29",
});
