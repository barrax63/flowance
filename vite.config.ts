import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config: React plugin + dev server bound to all interfaces so it works in Docker.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: { host: "0.0.0.0", port: 5173 },
  preview: { host: "0.0.0.0", port: 4173 },
});
