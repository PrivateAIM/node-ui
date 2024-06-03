// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
      "nuxt-primevue"
  ],
  primevue: {
    // components: {
    //   include: "*",
    // },
    options: {
      ripple: true
    },
  },
  css: [
      'primevue/resources/themes/lara-dark-amber/theme.css', 'primeicons/primeicons.css'
  ],
  // components: [
  //   {
  //     path: './components',
  //     pathPrefix: false,
  //   },
  // ],
});
