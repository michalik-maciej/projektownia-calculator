import jwt from "jsonwebtoken"
import request from "supertest"
import { describe, expect, it } from "vitest"

import { createInMemoryOfferStore } from "./inMemoryOfferStore"
import { createApp } from "../app"

process.env.JWT_SECRET = "test-secret"

const cookie = `accessToken=${jwt.sign(
  { sub: "77777777-7777-7777-7777-777777777777", email: "a@b.c", role: "USER" },
  process.env.JWT_SECRET,
)}`

const adminCookie = `accessToken=${jwt.sign(
  {
    sub: "88888888-8888-8888-8888-888888888888",
    email: "d@e.f",
    role: "ADMIN",
  },
  process.env.JWT_SECRET,
)}`

function appWithBrokenStorage() {
  const offers = createInMemoryOfferStore()
  const connectionRefused = async () => {
    throw new Error("connection refused")
  }

  return createApp({
    components: {
      createComponent: connectionRefused,
      deleteComponent: connectionRefused,
      updateComponent: connectionRefused,
    },
    getInventory: async () => {
      throw new Error("connection refused")
    },
    offers: {
      ...offers,
      getAllOffers: async () => {
        throw new Error("connection refused")
      },
      getOfferById: async () => {
        throw new Error("connection refused")
      },
    },
  })
}

describe("endpoints whose storage is unreachable", () => {
  it("answers the offer list with a JSON 500", async () => {
    const res = await request(appWithBrokenStorage())
      .get("/api/offers")
      .set("Cookie", cookie)

    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: "Reading the offers failed" })
  })

  it("answers a single offer with a JSON 500", async () => {
    const res = await request(appWithBrokenStorage())
      .get("/api/offers/9c92ab09-1f56-403d-a86f-c70087645c62")
      .set("Cookie", cookie)

    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: "Reading the offer failed" })
  })

  it("answers deleting an offer with a JSON 500", async () => {
    const res = await request(appWithBrokenStorage())
      .delete("/api/offers/9c92ab09-1f56-403d-a86f-c70087645c62")
      .set("Cookie", cookie)

    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: "Offer deletion failed" })
  })

  it("answers the catalogue with a JSON 500", async () => {
    const res = await request(appWithBrokenStorage())
      .get("/api/inventory/items")
      .set("Cookie", cookie)

    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: "Reading the catalogue failed" })
  })

  it("answers adding a catalogue component with a JSON 500", async () => {
    const res = await request(appWithBrokenStorage())
      .post("/api/inventory/items")
      .set("Cookie", adminCookie)
      .send({
        category: "shelf",
        depth: 47,
        height: null,
        label: "Półka 80/47",
        price: 10,
        width: 80,
      })

    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: "Component creation failed" })
  })
})
