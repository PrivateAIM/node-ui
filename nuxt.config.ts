// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";
import { Flame } from "./app/assets/primevue/flame-preset";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  modules: [
    "@primevue/nuxt-module",
    "@sidebase/nuxt-auth",
    "@pinia/nuxt",
    "nuxt-echarts",
  ],

  plugins: ["./app/plugins/api.ts"],

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
      idpProvider: process.env.NUXT_PUBLIC_IDP_PROVIDER || "hub",
      victoriaLogsUrl: process.env.NUXT_PUBLIC_VICTORIA_LOGS_URL,
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
      defaultProvider: process.env.NUXT_PUBLIC_IDP_PROVIDER ?? "hub",
      addDefaultCallbackUrl: true,
    },
    sessionRefresh: {
      enablePeriodically: 60000, // Check every 60 seconds
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

  echarts: {
    renderer: ["canvas"],
    charts: ["HeatmapChart"],
    components: ["TooltipComponent", "VisualMapComponent", "GridComponent"],
  },

  css: [
    "~/assets/css/main.css",
    "primeicons/primeicons.css",
    "~/assets/css/elements.css",
    "~/assets/css/table.css",
    "~/assets/css/preferences.css",
    "~/assets/css/toast.css",
  ],

  nitro: {
    alias: {
      "node-fetch-native/proxy": join(
        projectRoot,
        "node_modules/node-fetch-native/dist/proxy.cjs",
      ),
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  compatibilityDate: "2026-02-05",
});
