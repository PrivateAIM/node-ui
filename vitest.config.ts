import tsconfigPaths from "vite-tsconfig-paths";
import { defineVitestConfig } from "@nuxt/test-utils/config";
import path from "path";

const mockNuxtAuth = {
  name: "mock-nuxt-auth",
  enforce: "pre" as const,
  resolveId(id: string) {
    if (/[/@]sidebase[/+]nuxt-auth/.test(id)) {
      return path.resolve(
        import.meta.dirname,
        "./test/mockapi/nuxt-auth-mock.ts",
      );
    }
  },
};

export default defineVitestConfig({
  plugins: [tsconfigPaths(), mockNuxtAuth],
  test: {
    globals: true,
    env: {
      TZ: "Europe/Berlin",
    },
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
      "~": path.resolve(import.meta.dirname, "./app"),
      "@": path.resolve(import.meta.dirname, "."),
    },
  },
});
