import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config: React plugin + "@" alias for src.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
