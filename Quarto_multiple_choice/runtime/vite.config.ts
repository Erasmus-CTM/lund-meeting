/// <reference types="vitest/config" />
import { defineConfig } from "vite";

export default defineConfig({
  // we want relative paths to serve for the quarto extension
  base: "./",

  // aim for quarto extension
  build: {
    outDir: "../py-activity-quarto/_extensions/py-activity/assets/runtime",
    emptyOutDir: true,

    lib: {
      entry: "src/main.ts",
      name: "PyActivity",
      // ES-module is modern and safe
      formats: ["es"],
    },
    // saves a few ms:
    reportCompressedSize: false,
  },
  // browser like environment
  test: {
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
  },
  worker: {
    format: "es",
    // we want them in the same dir as other scripts
    // want avoid hashes
    rollupOptions: {
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
  server: {
    // Slow when loading pyodide
    hmr: false,
  },
});
