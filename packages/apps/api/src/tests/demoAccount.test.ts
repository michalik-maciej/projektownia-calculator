import jwt from "jsonwebtoken"
import request from "supertest"
import { describe, expect, it } from "vitest"

import { componentCatalogMock } from "@/domain/fixtures/componentCatalog"

import { createInMemoryUserStore } from "./inMemoryUserStore"
import { createApp } from "../app"

process.env.JWT_SECRET = "test-secret"
const secret = process.env.JWT_SECRET

function setup() {
  const users = createInMemoryUserStore()
  const app = createApp({
    getInventory: async () => componentCatalogMock,
    users,
  })

  return { app, users }
}

function cookieFor(role: "ADMIN" | "DEMO" | "USER") {
  const token = jwt.sign(
    { sub: "66666666-6666-6666-6666-666666666666", email: "x@y.z", role },
    secret,
  )

  return `accessToken=${token}`
}

describe("demo account", () => {
  it("starts a fresh demo account on every session", async () => {
    const { app, users } = setup()

    const first = await request(app).post("/api/auth/demo")
    const second = await request(app).post("/api/auth/demo")

    expect(first.status).toBe(200)
    expect(first.body.user).toMatchObject({ role: "DEMO" })
    expect(first.headers["set-cookie"]?.[0]).toContain("accessToken=")
    expect(second.body.user.id).not.toBe(first.body.user.id)
    expect(users.all()).toHaveLength(2)
  })

  it("cleans up demo accounts older than the retention window on the next login", async () => {
    const { app, users } = setup()

    await request(app).post("/api/auth/demo")
    const [stale] = users.all()
    if (stale) {
      stale.createdAt = new Date(Date.now() - 25 * 60 * 60 * 1000)
    }

    const res = await request(app).post("/api/auth/demo")

    expect(users.all()).toHaveLength(1)
    expect(users.all()[0]?.id).toBe(res.body.user.id)
  })

  it("gives the demo account a password nobody was told", async () => {
    const { app, users } = setup()

    await request(app).post("/api/auth/demo")
    const [demo] = users.all()

    expect(demo?.password).toMatch(/^\$2[aby]\$/)
    expect(demo?.password).not.toContain("demo")
  })

  it("refuses to let a demo session change the catalogue", async () => {
    const { app } = setup()
    const cookie = cookieFor("DEMO")

    const attempts = await Promise.all([
      request(app).post("/api/inventory/items").set("Cookie", cookie).send({}),
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
  })

  it("lets an ordinary account through to the catalogue controllers", async () => {
    const { app } = setup()

    const res = await request(app)
      .post("/api/inventory/items")
      .set("Cookie", cookieFor("USER"))
      .send({})

    expect(res.status).toBe(400)
  })

  it("keeps the demo session out of the admin-only registration", async () => {
    const { app } = setup()

    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", cookieFor("DEMO"))
      .send({ email: "someone@example.com", password: "password123" })

    expect(res.status).toBe(403)
  })
})
