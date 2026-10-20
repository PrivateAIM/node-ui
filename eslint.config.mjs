import eslintConfigPrettier from "eslint-config-prettier";
import withNuxt from "./.nuxt/eslint.config.mjs";

export default withNuxt(
  {
    ignores: [
      ".playwright-mcp/**",
      ".superpowers/**",
      "coverage/**",
      "public/**",
      "app/services/Api.ts",
    ],
  },
  {
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/attribute-hyphenation": "off",
      "vue/v-on-event-hyphenation": "off",
    },
  },
  eslintConfigPrettier,
);
