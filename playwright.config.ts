import { defineConfig } from "@playwright/test"

const WEB_URL = "http://localhost:5173"
const API_URL = "http://localhost:3000"

const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://demo:demo@localhost:5432/app"

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: WEB_URL,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command:
        "pnpm --filter @projektownia-calculator/api exec tsx src/server.ts",
      url: `${API_URL}/api/health`,
      reuseExistingServer: !process.env.CI,
      env: {
        DATABASE_URL: databaseUrl,
        JWT_SECRET: "end-to-end-secret",
        PORT: "3000",
        WEBAPP_DOMAIN: WEB_URL,
      },
    },
    {
      command:
        "pnpm --filter @projektownia-calculator/web exec vite --port 5173 --strictPort",
      url: WEB_URL,
      reuseExistingServer: !process.env.CI,
      env: { VITE_API_URL: `${API_URL}/api` },
    },
  ],
})
