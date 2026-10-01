import { describe, expect, it } from "vitest"

import { getVersionInfo } from "./version"

describe("getVersionInfo", () => {
  it("reads the product version from the root package.json", () => {
    const { version } = getVersionInfo()

    expect(version).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it("shortens COMMIT_SHA to 7 characters", () => {
    process.env.COMMIT_SHA = "fb9d357aa656be215f4d43042063ace60d7fbed1"

    expect(getVersionInfo().commit).toBe("fb9d357")

    delete process.env.COMMIT_SHA
  })

  it("falls back to unknown when COMMIT_SHA is not set", () => {
    delete process.env.COMMIT_SHA

    expect(getVersionInfo().commit).toBe("unknown")
  })
})
