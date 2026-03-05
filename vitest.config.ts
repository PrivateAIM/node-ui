import tsconfigPaths from "vite-tsconfig-paths";
import { defineVitestConfig } from "@nuxt/test-utils/config";
import path from "path";
// Intercept @sidebase/nuxt-auth AND any subpath imports (e.g. the dist
// runtime files that Nuxt's auto-import plugin injects) before Vite's
// package-exports resolver runs. A regex alias would require the array alias
// format which breaks defineVitestConfig's Nuxt virtual-module setup.
const mockNuxtAuth = {
  name: "mock-nuxt-auth",
  enforce: "pre" as const,
  resolveId(id: string) {
    // Match the package name in all forms:
    //   "@sidebase/nuxt-auth"         – direct package import
    //   "@sidebase/nuxt-auth/dist/…"  – package subpath import
    //   "…/@sidebase/nuxt-auth/…"     – absolute path with package segment
    //   "…/@sidebase+nuxt-auth@…/…"   – pnpm-mangled path from #imports
    if (/[/@]sidebase[/+]nuxt-auth/.test(id)) {
      return path.resolve(__dirname, "./test/mockapi/nuxt-auth-mock.ts");
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
      "~": path.resolve(__dirname, "./app"),
      "@": path.resolve(__dirname, "."),
    },
  },
});
