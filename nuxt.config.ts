// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  ssr: false,
  modules: ["nuxt-primevue", "@pinia/nuxt"],
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
  },
  css: [
    "primevue/resources/themes/lara-dark-amber/theme.css",
    "primeicons/primeicons.css",
  ],
});
