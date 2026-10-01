import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"

const COMMIT_SHA_LENGTH = 7

const rootPackageJsonUrl = new URL("../../../package.json", import.meta.url)
const rootPackageJson = JSON.parse(
  readFileSync(fileURLToPath(rootPackageJsonUrl), "utf-8"),
) as { version?: string }

const commit =
  (process.env.VERCEL_GIT_COMMIT_SHA ?? "").slice(0, COMMIT_SHA_LENGTH) || "dev"

export default defineConfig({
  plugins: [
    tanstackRouter({ autoCodeSplitting: true }),
    tsconfigPaths({
      projects: ["./tsconfig.json"],
    }),
    react(),
    tailwindcss(),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(rootPackageJson.version ?? "unknown"),
    __APP_COMMIT__: JSON.stringify(commit),
  },
  build: {
    outDir: "dist",
  },
})
