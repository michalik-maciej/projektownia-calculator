import { describe, expect, it } from "vitest"

import { createSignOutOnUnauthorized } from "./createSignOutOnUnauthorized"
import { ApiError } from "../../core/createMethod.api"

function apiError(status: number) {
  return new ApiError({
    method: "GET",
    status,
    statusText: "",
    url: "/api/offers",
  })
}

function setup(pathname: string) {
  let signOutCalls = 0
  const handleError = createSignOutOnUnauthorized({
    getPathname: () => pathname,
    signOut: () => {
      signOutCalls += 1
    },
  })

  return { handleError, signOutCalls: () => signOutCalls }
}

describe("createSignOutOnUnauthorized", () => {
  it("signs out when a request outside the login page answers 401", () => {
    const { handleError, signOutCalls } = setup("/offer")

    handleError(apiError(401))

    expect(signOutCalls()).toBe(1)
  })

  it("leaves the session alone for any other failure", () => {
    const { handleError, signOutCalls } = setup("/offer")

    handleError(apiError(500))
    handleError(new Error("network down"))

    expect(signOutCalls()).toBe(0)
  })

  it("does not sign out again on the login page, where 401 is the expected answer", () => {
    const { handleError, signOutCalls } = setup("/login")

    handleError(apiError(401))

    expect(signOutCalls()).toBe(0)
  })
})
