import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
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
      // `Api.ts` is regenerated from the hub-adapter's OpenAPI document, which
      // still mirrors the Hub's entities. Those copies drift; the Hub's own
      // packages do not. Import them from `@privateaim/core-kit` instead.
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/services/Api"],
              importNames: [
                "Analysis",
                "AnalysisBucket",
                "AnalysisBucketType",
                "AnalysisNode",
                "DetailedAnalysis",
                "MasterImage",
                "MasterImageCommandArgument",
                "Node",
                "Project",
                "ProjectNode",
                "Registry",
                "RegistryProject",
              ],
              message:
                "Hub entities come from @privateaim/core-kit, not from the generated Api.ts.",
            },
          ],
        },
      ],
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
