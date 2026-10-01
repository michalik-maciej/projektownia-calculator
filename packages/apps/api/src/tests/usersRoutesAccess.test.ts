import jwt from "jsonwebtoken"
import request from "supertest"
import { describe, expect, it } from "vitest"

import { componentCatalogMock } from "@/domain/fixtures/componentCatalog"

import { createInMemoryUserStore } from "./inMemoryUserStore"
import { createApp } from "../app"

process.env.JWT_SECRET = "test-secret"
const secret = process.env.JWT_SECRET

const adminId = "88888888-8888-8888-8888-888888888888"

function cookieFor(userId: string, role: "ADMIN" | "USER") {
  const token = jwt.sign(
    { sub: userId, email: `${userId}@example.com`, role },
    secret,
  )

  return `accessToken=${token}`
}

const adminCookie = cookieFor(adminId, "ADMIN")

async function setup() {
  const users = createInMemoryUserStore()
  const app = createApp({
    getInventory: async () => componentCatalogMock,
    users,
  })

  const other = await users.createUser("other@example.com", "hash")

  return { app, other, users }
}

describe("user management routes", () => {
  it("rejects listing users without a cookie", async () => {
    const { app } = await setup()

    const res = await request(app).get("/api/users")

    expect(res.status).toBe(401)
  })

  it("rejects listing users for a non-admin", async () => {
    const { app, other } = await setup()

    const res = await request(app)
      .get("/api/users")
      .set("Cookie", cookieFor(other.id, "USER"))

    expect(res.status).toBe(403)
  })

  it("lists users for an admin without their password hashes", async () => {
    const { app, other } = await setup()

    const res = await request(app).get("/api/users").set("Cookie", adminCookie)

    expect(res.status).toBe(200)
    expect(res.body).toEqual([
      { id: other.id, email: other.email, role: other.role },
    ])
  })

  it("excludes demo accounts from the user list", async () => {
    const { app, users } = await setup()
    await users.createUser("demo+abc@projektownia.app", "hash", "DEMO")

    const res = await request(app).get("/api/users").set("Cookie", adminCookie)

    expect(res.status).toBe(200)
    expect(res.body.map((user: { role: string }) => user.role)).not.toContain(
      "DEMO",
    )
  })

  it("refuses to let an admin delete their own account", async () => {
    const { app } = await setup()

    const res = await request(app)
      .delete(`/api/users/${adminId}`)
      .set("Cookie", adminCookie)

    expect(res.status).toBe(400)
  })

  it("blocks deleting a user who has existing offers", async () => {
    const { app, other, users } = await setup()
    users.markAsHavingOffers(other.id)

    const res = await request(app)
      .delete(`/api/users/${other.id}`)
      .set("Cookie", adminCookie)

    expect(res.status).toBe(409)
  })

  it("deletes a user for an admin", async () => {
    const { app, other, users } = await setup()

    const res = await request(app)
      .delete(`/api/users/${other.id}`)
      .set("Cookie", adminCookie)

    expect(res.status).toBe(204)
    expect(users.all()).toHaveLength(0)
  })

  it("rejects setting a password for a non-admin", async () => {
    const { app, other } = await setup()

    const res = await request(app)
      .put(`/api/users/${other.id}/password`)
      .set("Cookie", cookieFor(other.id, "USER"))
      .send({ password: "newpassword123" })

    expect(res.status).toBe(403)
  })

  it("rejects a password that is too short", async () => {
    const { app, other } = await setup()

    const res = await request(app)
      .put(`/api/users/${other.id}/password`)
      .set("Cookie", adminCookie)
      .send({ password: "short" })

    expect(res.status).toBe(400)
  })

  it("sets a new password for a user as an admin", async () => {
    const { app, other, users } = await setup()

    const res = await request(app)
      .put(`/api/users/${other.id}/password`)
      .set("Cookie", adminCookie)
      .send({ password: "newpassword123" })

    expect(res.status).toBe(204)
    expect(users.all()[0]?.password).not.toBe("hash")
  })
})
