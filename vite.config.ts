import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";

const isWatch = process.argv.includes("--watch");

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: "dist",
    emptyOutDir: !isWatch,
    rollupOptions: {
      input: {
        style: resolve(__dirname, "src/popup/styles/index.css"),
        background: resolve(__dirname, "src/background/background.ts"),
        content: resolve(__dirname, "src/content/content.ts"),
        popup: resolve(__dirname, "src/popup/main.tsx"),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name === "background") return "background.js";
          if (chunk.name === "content") return "content.js";
          return "assets/[name].js";
        },
        chunkFileNames: "assets/chunks/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
