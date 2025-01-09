// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  ssr: true,
  devtools: { enabled: false },
  modules: ["nuxt-primevue", "@sidebase/nuxt-auth"],

  runtimeConfig: {
    authSecret: process.env.AUTH_SECRET,
    keycloakClientId: process.env.KEYCLOAK_CLIENT_ID,
    keycloakClientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || "http://localhost:3000",
      origin:
        process.env.NUXT_PUBLIC_ORIGIN || "http://localhost:3000/api/auth",
      hubAdapterUrl:
        process.env.NUXT_PUBLIC_HUB_ADAPTER_URL || "http://localhost:5000",
    },
  },

  auth: {
    isEnabled: true,
    originEnvKey: "NUXT_PUBLIC_ORIGIN",
    disableServerSideAuth: false,
    globalAppMiddleware: true,
    provider: {
      type: "authjs",
      trustHost: false,
      defaultProvider: "keycloak",
      addDefaultCallbackUrl: true,
    },
    sessionRefresh: {
      enablePeriodically: 10000, // ms
      enableOnWindowFocus: true,
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

  css: [
    "primevue/resources/themes/lara-dark-amber/theme.css",
    "primeicons/primeicons.css",
    "@/assets/css/table.css",
    "@/assets/css/card.css",
  ],

  compatibilityDate: "2024-09-30",
});
