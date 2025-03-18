import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [tsconfigPaths(), vue()],
  test: {
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*",
    ],
    environment: "happy-dom",
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./"),
    },
  },
});
