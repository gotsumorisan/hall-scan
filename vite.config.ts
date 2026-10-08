import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import { loadEnv } from "vite";
// configure-pages supplies the actual repository base path during deployment.
export default defineConfig(({ mode }) => {
  const base = (loadEnv(mode, ".", "").HALL_SCAN_BASE || "/").replace(
    /\/?$/,
    "/",
  );
  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: "prompt",
        includeAssets: ["icon.svg", "apple-touch-icon.png"],
        manifest: {
          name: "HALL SCAN",
          short_name: "HALL SCAN",
          description: "根拠で選ぶ、ホール巡回ノート",
          theme_color: "#080d15",
          background_color: "#080d15",
          display: "standalone",
          start_url: base,
          scope: base,
          icons: [
            { src: `${base}icon-192.png`, sizes: "192x192", type: "image/png" },
            {
              src: `${base}icon-512.png`,
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          clientsClaim: true,
          navigateFallback: `${base}index.html`,
          globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        },
      }),
    ],
    test: {
      environment: "jsdom",
      setupFiles: ["src/tests/setup.ts"],
      include: ["src/**/*.test.{ts,tsx}"],
      pool: "forks",
      maxWorkers: 1,
    },
  };
});
