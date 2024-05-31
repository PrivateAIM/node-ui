import globals from "globals";
import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";

import tsParser from '@typescript-eslint/parser';
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  eslint.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      parser: tsParser,
      globals: globals.node,
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "no-console": "error",
    },
    ignores: [
      "**/dist/*",
      "**/*.d.ts",
      "**/node_modules/**",
      "**/.nuxt",
      "**/writable/**",
      "**/packages/frontend/ui/components/svg/**",
      "public/**",
    ],
  },
];
