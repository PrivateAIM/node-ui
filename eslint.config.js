import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "**/*.d.ts",
      ".nuxt/**",
      ".output/**",
      ".playwright-mcp/**",
      ".superpowers/**",
      "coverage/**",
      "public/**",
    ],
  },
  pluginJs.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/essential"],
  {
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },
    rules: {
      "vue/multi-word-component-names": 0,
      "no-unused-vars": "off",
      "no-undef": "off",
    },
  },
];
