// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";
import { Flame } from "./assets/primevue/flame-preset";

export default defineNuxtConfig({
  ssr: process.env.NODE_ENV !== "development",
  devtools: { enabled: false },
  modules: [
    "@primevue/nuxt-module",
    "@sidebase/nuxt-auth",
    "@nuxtjs/tailwindcss",
  ],

  runtimeConfig: {
    authSecret: process.env.NUXT_AUTH_SECRET,
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || "http://localhost:3000",
      origin:
        process.env.NUXT_PUBLIC_ORIGIN ||
        "http://localhost:3000/flame/api/auth",
      hubAdapterUrl:
        process.env.NUXT_PUBLIC_HUB_ADAPTER_URL || "http://localhost:5000",
      version: process.env.npm_package_version,
      idpIssuer: process.env.NUXT_PUBLIC_IDP_ISSUER,
      idpProvider: process.env.NUXT_PUBLIC_IDP_PROVIDER || "keycloak",
      internalKeycloakUrl: process.env.NUXT_PUBLIC_INTERNAL_KEYCLOAK_URL || "",
    },
  },

  auth: {
    isEnabled: true,
    originEnvKey: "NUXT_PUBLIC_ORIGIN",
    baseURL:
      process.env.NUXT_PUBLIC_ORIGIN || "http://localhost:3000/flame/api/auth",
    disableServerSideAuth: false,
    globalAppMiddleware: true,
    provider: {
      type: "authjs",
      trustHost: false,
      defaultProvider: process.env.NUXT_PUBLIC_IDP_PROVIDER ?? "keycloak",
      addDefaultCallbackUrl: true,
    },
    sessionRefresh: {
      enablePeriodically: 10000, // Check every 10 seconds
      enableOnWindowFocus: true,
    },
  },

  primevue: {
    autoImport: true,
    options: {
      ripple: true,
      theme: {
        preset: Flame,
        options: {
          darkModeSelector: ".flame-dark",
        },
      },
    },
    directives: {
      include: ["Ripple", "Tooltip", "Toast"],
    },
  },

  css: [
    "primeicons/primeicons.css",
    "@/assets/css/elements.css",
    "@/assets/css/table.css",
  ],

  compatibilityDate: "2024-09-30",
});
