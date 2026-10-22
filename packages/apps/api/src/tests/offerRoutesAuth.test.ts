import request from "supertest"
import { describe, expect, it } from "vitest"

import { componentCatalogMock } from "@/domain/fixtures/componentCatalog"

import { createApp } from "../app"

process.env.JWT_SECRET = "test-secret"

const app = createApp({ getInventory: async () => componentCatalogMock })
const offerId = "9c92ab09-1f56-403d-a86f-c70087645c62"

const guardedRoutes = [
  { method: "get", path: "/api/offers" },
  { method: "get", path: `/api/offers/${offerId}` },
  { method: "post", path: "/api/offers" },
  { method: "put", path: `/api/offers/${offerId}` },
  { method: "delete", path: `/api/offers/${offerId}` },
  { method: "put", path: `/api/offers/${offerId}/shares` },
] as const

describe("offer routes without authentication", () => {
  for (const { method, path } of guardedRoutes) {
    it(`rejects ${method.toUpperCase()} ${path} with 401`, async () => {
      const res = await request(app)[method](path).send({})

      expect(res.status).toBe(401)
      expect(res.body).toEqual({ error: "Unauthorized" })
    })
  }

  it("rejects a request carrying a token signed with the wrong secret", async () => {
    const res = await request(app)
      .get("/api/offers")
      .set("Cookie", "accessToken=not-a-valid-token")

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: "Invalid token" })
  })
})
