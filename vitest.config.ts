import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["packages/domain/**/*.ts"],
      thresholds: {
        branches: 80,
        functions: 90,
        lines: 90,
        statements: 90,
      },
    },
    projects: [
      {
        plugins: [tsconfigPaths()],
        test: {
          name: "node",
          environment: "node",
          include: ["packages/**/**/*.test.ts", "tests/**/*.test.ts"],
          exclude: ["packages/apps/web/**"],
        },
      },
      {
        plugins: [tsconfigPaths()],
        define: {
          __APP_VERSION__: JSON.stringify("test"),
          __APP_COMMIT__: JSON.stringify("test"),
        },
        test: {
          name: "web",
          environment: "jsdom",
          include: ["packages/apps/web/**/*.test.{ts,tsx}"],
          setupFiles: ["./packages/apps/web/src/vitest.setup.ts"],
        },
      },
    ],
  },
})
