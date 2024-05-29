// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["nuxt-primevue"],
  primevue: {
    components: {
      include: "*",
    },
    options: {
      ripple: true,
    },
  },
  css: ["primevue/resources/themes/lara-dark-amber/theme.css"],
  components: [
    {
      path: './components',
      pathPrefix: false,
    },
  ],
});
