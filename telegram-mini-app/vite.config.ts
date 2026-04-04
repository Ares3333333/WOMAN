import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Не подхватывать postcss.config из корня монорепо (там Tailwind для Next.js) —
  // иначе на PaaS/Vite падает: модуль tailwindcss не установлен в telegram-mini-app.
  css: {
    postcss: {
      plugins: [],
    },
  },
  server: {
    port: 5174,
    host: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "dist",
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
