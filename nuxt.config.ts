// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";
// import { FlamePreset } from "./assets/themes/flame";
import Lara from "@primevue/themes/aura";

export default defineNuxtConfig({
  ssr: true,
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
        process.env.NUXT_PUBLIC_ORIGIN || "http://localhost:3000/api/auth",
      hubAdapterUrl:
        process.env.NUXT_PUBLIC_HUB_ADAPTER_URL || "http://localhost:5000",
      version: process.env.npm_package_version,
      keycloakBaseUrl: process.env.NUXT_PUBLIC_KEYCLOAK_BASE_URL || "",
    },
  },

  auth: {
    isEnabled: true,
    originEnvKey: "NUXT_PUBLIC_ORIGIN",
    baseURL: process.env.NUXT_PUBLIC_ORIGIN || "http://localhost:3000/api/auth",
    disableServerSideAuth: false,
    globalAppMiddleware: true,
    provider: {
      type: "authjs",
      trustHost: false,
      defaultProvider: "keycloak",
      addDefaultCallbackUrl: true,
    },
    sessionRefresh: {
      enablePeriodically: true,
    },
  },

  postcss: {
    plugins: {
      "postcss-import": {},
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  primevue: {
    autoImport: true,
    options: {
      ripple: true,
      theme: {
        preset: Lara,
      },
    },
    // components: {
    //   include: ["Button", "DataTable"],
    // },
    directives: {
      include: ["Ripple", "Tooltip", "Toast"],
    },
  },

  css: [
    "primeicons/primeicons.css",
    "@/assets/css/table.css",
    "@/assets/css/card.css",
  ],

  compatibilityDate: "2024-09-30",
});
