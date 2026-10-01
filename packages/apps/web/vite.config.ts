import { defineConfig } from "vite"
import tsconfigPaths from "vite-tsconfig-paths"
import tailwindcss from "@tailwindcss/vite"
import { tanstackRouter } from "@tanstack/router-plugin/vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [
    tanstackRouter({ autoCodeSplitting: true }),
    tsconfigPaths({
      projects: ["./tsconfig.json"],
    }),
    react(),
    tailwindcss(),
  ],
  build: {
    outDir: "dist",
  },
})
