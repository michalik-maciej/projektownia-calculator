import jwt from "jsonwebtoken"
import request from "supertest"
import { describe, expect, it } from "vitest"

import { componentCatalogMock } from "@/domain/fixtures/componentCatalog"

import { createApp } from "../app"

process.env.JWT_SECRET = "test-secret"
const secret = process.env.JWT_SECRET

const app = createApp({ getInventory: async () => componentCatalogMock })

function cookieFor(role: "ADMIN" | "USER") {
  const token = jwt.sign(
    {
      sub: "55555555-5555-5555-5555-555555555555",
      email: "tester@example.com",
      role,
    },
    secret,
  )

  return `accessToken=${token}`
}

describe("auth routes access", () => {
  it("rejects registration without a cookie", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "intruder@example.com",
      password: "password123",
    })

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: "Unauthorized" })
  })

  it("rejects registration by a signed-in user who is not an admin", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", cookieFor("USER"))
      .send({ email: "intruder@example.com", password: "password123" })

    expect(res.status).toBe(403)
    expect(res.body).toEqual({ error: "Forbidden" })
  })

  it("lets an admin reach the registration controller", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", cookieFor("ADMIN"))
      .send({})

    expect(res.status).toBe(400)
    expect(res.body).toMatchObject({ error: "Invalid request body" })
  })

  it("rejects reading the current user without a cookie", async () => {
    const res = await request(app).get("/api/auth/user")

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: "Unauthorized" })
  })

  it("keeps login public", async () => {
    const res = await request(app).post("/api/auth/login").send({})

    expect(res.status).toBe(400)
  })

  it("sends security headers and hides the framework", async () => {
    const res = await request(app).get("/api/health")

    expect(res.status).toBe(200)
    expect(res.headers["x-content-type-options"]).toBe("nosniff")
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN")
    expect(res.headers["x-powered-by"]).toBeUndefined()
  })

  it("answers health with its version and commit", async () => {
    const res = await request(app).get("/api/health")

    expect(res.body).toMatchObject({ status: "ok" })
    expect(typeof res.body.version).toBe("string")
    expect(typeof res.body.commit).toBe("string")
  })
})
