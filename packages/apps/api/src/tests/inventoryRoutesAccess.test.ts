import jwt from "jsonwebtoken"
import request from "supertest"
import { describe, expect, it } from "vitest"

import { componentCatalogMock } from "@/domain/fixtures/componentCatalog"

import { createInMemoryUserStore } from "./inMemoryUserStore"
import { createApp } from "../app"

process.env.JWT_SECRET = "test-secret"
const secret = process.env.JWT_SECRET

const app = createApp({
  getInventory: async () => componentCatalogMock,
  users: createInMemoryUserStore(),
})

function cookieFor(role: "ADMIN" | "DEMO" | "USER") {
  const token = jwt.sign(
    { sub: "66666666-6666-6666-6666-666666666666", email: "x@y.z", role },
    secret,
  )

  return `accessToken=${token}`
}

describe("inventory routes", () => {
  it.each(["USER", "DEMO"] as const)(
    "refuses to let a %s account change the catalogue",
    async (role) => {
      const cookie = cookieFor(role)

      const attempts = await Promise.all([
        request(app)
          .post("/api/inventory/items")
          .set("Cookie", cookie)
          .send({}),
        request(app)
          .put("/api/inventory/items/abc")
          .set("Cookie", cookie)
          .send({}),
        request(app).delete("/api/inventory/items/abc").set("Cookie", cookie),
      ])

      for (const res of attempts) {
        expect(res.status).toBe(403)
        expect(res.body).toEqual({ error: "Forbidden" })
      }
    },
  )

  it("lets an admin through to the catalogue controllers", async () => {
    const res = await request(app)
      .post("/api/inventory/items")
      .set("Cookie", cookieFor("ADMIN"))
      .send({})

    expect(res.status).toBe(400)
  })
})
