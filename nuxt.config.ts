// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "nuxt-primevue",
    // "nuxt-oidc-auth"
  ],
  runtimeConfig: {
    public: {
      baseURL: process.env.HUB_ADAPTER_API_URL || "http://localhost:5000/",
    },
  },
  // oidc: {
  //   defaultProvider: "keycloak",
  //   providers: {
  //     keycloak: {
  //       audience: "account",
  //       clientId:
  //         process.env.NUXT_OIDC_PROVIDERS_KEYCLOAK_CLIENT_ID || "node-ui",
  //       clientSecret:
  //         process.env.NUXT_OIDC_PROVIDERS_KEYCLOAK_CLIENT_SECRET || "",
  //       baseUrl:
  //         process.env.NUXT_OIDC_PROVIDERS_KEYCLOAK_BASE_URL ||
  //         "http://localhost:8080/",
  //       redirectUri: process.env.BASE_URL + "/auth/keycloak/callback",
  //       tokenRequestType: "form-urlencoded",
  //       exposeAccessToken: true,
  //       // logoutUrl:
  //       //   process.env.NUXT_OIDC_PROVIDERS_KEYCLOAK_BASE_URL +
  //       //   "/protocol/openid-connect/logout",
  //     },
  //   },
  //   session: {
  //     expirationCheck: true,
  //     automaticRefresh: true,
  //   },
  //   middleware: {
  //     globalMiddlewareEnabled: true,
  //     customLoginPage: false,
  //   },
  // },
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
