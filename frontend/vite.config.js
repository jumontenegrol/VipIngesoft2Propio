import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/VipIngesoft2Propio/",
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: "../frontend/dist",
    //outDir: "dist",
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
  },
});