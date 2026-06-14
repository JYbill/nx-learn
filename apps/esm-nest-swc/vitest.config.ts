import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/apps/esm-nest-swc",
  oxc: false as const,
  plugins: [swc.vite()],
  test: {
    name: "esm-nest-swc",
    globals: false,
    environment: "node",
    include: ["{src,tests}/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    reporters: ["default"],
    coverage: {
      reportsDirectory: "coverage",
      provider: "v8" as const,
    },
  },
}));
