import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  eslintConfigPrettier,
  {
      plugins: {
        'typescript-eslint': tseslint.plugin,
      },
      languageOptions: {
        parserOptions: {
          extraFileExtensions: ['.vue'],
          project: "./tsconfig.json",
          parser: tseslint.parser,
        },
      },
      ignores: [
          "**/dist/*",
          "**/*.d.ts",
          "**/node_modules/**",
          "**/.nuxt",
          "**/writable/**",
          "**/packages/frontend/ui/components/svg/**"
      ],
  }
]
