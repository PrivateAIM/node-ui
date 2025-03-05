// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";
import Lara from "@primeuix/themes/lara";

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
      keycloakBaseUrl: process.env.NUXT_PUBLIC_KEYCLOAK_BASE_URL || "",
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
      defaultProvider: "keycloak",
      addDefaultCallbackUrl: true,
    },
    sessionRefresh: {
      enablePeriodically: 1000 * 15, // every 15s
      enableOnWindowFocus: true,
    },
  },

  primevue: {
    autoImport: true,
    options: {
      ripple: true,
      theme: {
        preset: Lara,
        options: {
          darkModeSelector: true,
        },
      },
    },
    directives: {
      include: ["Ripple", "Tooltip", "Toast"],
    },
  },

  css: [
    "primeicons/primeicons.css",
    // "@/assets/css/base.css",
    "@/assets/css/headers.css",
  ],

  compatibilityDate: "2024-09-30",
});
