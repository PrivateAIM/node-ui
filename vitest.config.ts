import tsconfigPaths from "vite-tsconfig-paths";
import { defineVitestConfig } from "@nuxt/test-utils/config";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineVitestConfig({
  plugins: [tsconfigPaths(), vue()],
  test: {
    globals: true,
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
    ],
    environment: "happy-dom",
    setupFiles: "./test/mockapi/setup.ts", // Load the config for testing
    coverage: {
      include: ["**/app/components/**"],
    },
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
});
