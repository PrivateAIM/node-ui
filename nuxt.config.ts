// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  modules: ["nuxt-primevue", "@pinia/nuxt"],

  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_BASE_URL || "http://localhost:3000",
      hubAdapterUrl:
        process.env.NUXT_HUB_ADAPTER_URL || "http://localhost:5000",
      keycloakUrl: process.env.NUXT_KEYCLOAK_BASE_URL as string,
      keycloakClientId: process.env.NUXT_KEYCLOAK_CLIENT_ID,
      keycloakClientSecret: process.env.NUXT_KEYCLOAK_CLIENT_SECRET,
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
  ],

  compatibilityDate: "2024-07-29",
});
