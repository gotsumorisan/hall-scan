import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: process.env.HALL_SCAN_E2E_URL || "http://127.0.0.1:4173/",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "mobile-edge",
      use: {
        ...devices["iPhone 13"],
        defaultBrowserType: "chromium",
        channel: "msedge",
      },
    },
  ],
  webServer: {
    command:
      "node node_modules/vite/bin/vite.js preview --host 127.0.0.1 --port 4173",
    url: process.env.HALL_SCAN_E2E_URL || "http://127.0.0.1:4173/",
    reuseExistingServer: true,
  },
});
