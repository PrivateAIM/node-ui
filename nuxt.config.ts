// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  modules: ["nuxt-primevue", "@pinia/nuxt"],

  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || "http://localhost:3000",
      hubAdapterUrl:
        process.env.NUXT_PUBLIC_HUB_ADAPTER_URL || "http://localhost:5000",
      keycloakUrl: process.env.NUXT_OIDC_PROVIDERS_KEYCLOAK_BASE_URL as string,
      keycloakRealm: process.env.NUXT_KEYCLOAK_REALM || "flame",
      keycloakClientId: process.env.NUXT_OIDC_PROVIDERS_KEYCLOAK_CLIENT_ID,
      keycloakClientSecret:
        process.env.NUXT_OIDC_PROVIDERS_KEYCLOAK_CLIENT_SECRET,
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
