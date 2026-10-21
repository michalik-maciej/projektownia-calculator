import jwt from "jsonwebtoken"
import request from "supertest"
import { describe, expect, it } from "vitest"

import { componentCatalogMock } from "@/domain/fixtures/componentCatalog"
import { validOfferInput } from "@/domain/fixtures/validOfferInput"

import { createInMemoryOfferStore } from "./inMemoryOfferStore"
import { createApp } from "../app"

process.env.JWT_SECRET = "test-secret"

const app = createApp({
  getInventory: async () => componentCatalogMock,
  offers: createInMemoryOfferStore(),
})
const authCookie = `accessToken=${jwt.sign(
  {
    sub: "44444444-4444-4444-4444-444444444444",
    email: "tester@example.com",
    role: "USER",
  },
  process.env.JWT_SECRET,
)}`

describe("POST /api/offers", () => {
  it("returns the saved offer priced for valid input", async () => {
    const res = await request(app)
      .post("/api/offers")
      .set("Cookie", authCookie)
      .send(validOfferInput)

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      output: {
        breakdown: expect.any(Object),
        layouts: expect.any(Array),
        pricing: expect.any(Object),
        title: "Offer test",
      },
      title: "Offer test",
    })
  })

  it("returns 400 for invalid payload", async () => {
    const response = await request(app)
      .post("/api/offers")
      .set("Cookie", authCookie)
      .send({})

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      error: "Invalid input",
      issues: {
        nested: {
          discountPercentage: expect.any(Array),
          layouts: expect.any(Array),
          title: expect.any(Array),
        },
      },
    })
  })

  it("saves an offer without pricing when the layout asks for a component the inventory lacks", async () => {
    const unstockedHeightInput = {
      ...validOfferInput,
      layouts: [
        {
          ...validOfferInput.layouts[0],
          height: 9999,
        },
      ],
    }

    const res = await request(app)
      .post("/api/offers")
      .set("Cookie", authCookie)
      .send(unstockedHeightInput)

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      missingComponent: { category: "leg", height: 9999 },
      output: null,
    })
  })

  it("prices an item set without any layout rules", async () => {
    const res = await request(app)
      .post("/api/offers")
      .set("Cookie", authCookie)
      .send({
        discountPercentage: 0,
        layouts: [{ items: [{ id: "foot-37", quantity: 2 }] }],
        title: "Zestaw",
      })

    expect(res.status).toBe(201)
    expect(res.body.output).toMatchObject({
      breakdown: {
        foot: [{ id: "foot-37", label: "Stopa 37", quantity: 2 }],
      },
      pricing: { basePrice: 88.78, discountPrice: 88.78 },
    })
  })

  it("returns 400 for an item set with a quantity below one", async () => {
    const res = await request(app)
      .post("/api/offers")
      .set("Cookie", authCookie)
      .send({
        discountPercentage: 0,
        layouts: [{ items: [{ id: "foot-37", quantity: 0 }] }],
        title: "Zestaw",
      })

    expect(res.status).toBe(400)
  })
})
