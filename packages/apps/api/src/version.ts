import { readFileSync } from "node:fs"
import { join } from "node:path"

export type VersionInfo = {
  version: string
  commit: string
}

const COMMIT_SHA_LENGTH = 7

function readProductVersion(): string {
  try {
    const packageJsonPath = join(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "package.json",
    )
    const { version } = JSON.parse(readFileSync(packageJsonPath, "utf-8")) as {
      version?: string
    }

    return version ?? "unknown"
  } catch {
    return "unknown"
  }
}

export function getVersionInfo(): VersionInfo {
  return {
    version: readProductVersion(),
    commit: process.env.COMMIT_SHA?.slice(0, COMMIT_SHA_LENGTH) || "unknown",
  }
}
