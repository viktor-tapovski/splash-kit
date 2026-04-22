import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    dts({
      include: ["src"],
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "SplashKit",
      fileName: "splash-kit",
      formats: ["es", "cjs", "umd"],
    },
    rollupOptions: {
      output: {
        exports: "named",
      },
    },
  },
  test: {
    environment: "happy-dom",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
});
