import jwt from "jsonwebtoken"
import request from "supertest"
import { describe, expect, it } from "vitest"

import { componentCatalogMock } from "@/domain/fixtures/componentCatalog"
import { validOfferInput } from "@/domain/fixtures/validOfferInput"
import { createOfferPreview } from "@/domain/orchestrations/createOfferPreview/createOfferPreview"
import { OfferSummary } from "@/schemas/Offer.schema"

import { createInMemoryOfferStore } from "./inMemoryOfferStore"
import { createApp } from "../app"

process.env.JWT_SECRET = "test-secret"
const secret = process.env.JWT_SECRET

const ownerId = "11111111-1111-1111-1111-111111111111"
const strangerId = "22222222-2222-2222-2222-222222222222"
const adminId = "33333333-3333-3333-3333-333333333333"

function cookieFor(userId: string, role: "ADMIN" | "USER") {
  const token = jwt.sign(
    { sub: userId, email: `${userId}@example.com`, role },
    secret,
  )

  return `accessToken=${token}`
}

const ownerCookie = cookieFor(ownerId, "USER")
const adminCookie = cookieFor(adminId, "ADMIN")

async function setup() {
  const offers = createInMemoryOfferStore()
  const app = createApp({
    getInventory: async () => componentCatalogMock,
    offers,
  })

  const ownOffer = await offers.createOffer({
    title: "Owner offer",
    input: validOfferInput,
    userId: ownerId,
  })
  const strangerOffer = await offers.createOffer({
    title: "Stranger offer",
    input: validOfferInput,
    userId: strangerId,
  })

  return { app, offers, ownOffer, strangerOffer }
}

describe("offer routes scoped to the offer owner", () => {
  it("lists only the offers the caller owns", async () => {
    const { app, ownOffer } = await setup()

    const res = await request(app).get("/api/offers").set("Cookie", ownerCookie)

    expect(res.status).toBe(200)
    expect(res.body).toEqual([
      {
        authorEmail: `${ownerId}@example.com`,
        createdAt: ownOffer.createdAt.toISOString(),
        id: ownOffer.id,
        lastUpdatedByEmail: `${ownerId}@example.com`,
        title: "Owner offer",
        updatedAt: ownOffer.updatedAt.toISOString(),
      },
    ])
  })

  it("lists every offer with its author for an admin", async () => {
    const { app, ownOffer, strangerOffer } = await setup()

    const res = await request(app).get("/api/offers").set("Cookie", adminCookie)

    expect(res.status).toBe(200)
    expect(
      res.body.map(({ authorEmail, id }: OfferSummary) => ({
        authorEmail,
        id,
      })),
    ).toEqual([
      { authorEmail: `${ownerId}@example.com`, id: ownOffer.id },
      { authorEmail: `${strangerId}@example.com`, id: strangerOffer.id },
    ])
  })

  it("returns the offer to the user who owns it", async () => {
    const { app, ownOffer } = await setup()

    const res = await request(app)
      .get(`/api/offers/${ownOffer.id}`)
      .set("Cookie", ownerCookie)

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: ownOffer.id, userId: ownerId })
  })

  it("prices an opened offer at the current catalogue prices", async () => {
    const offers = createInMemoryOfferStore()
    const ownOffer = await offers.createOffer({
      title: "Owner offer",
      input: validOfferInput,
      userId: ownerId,
    })
    const repricedCatalog = componentCatalogMock.map((component) => ({
      ...component,
      price: component.price * 2,
    }))
    const app = createApp({ getInventory: async () => repricedCatalog, offers })

    const res = await request(app)
      .get(`/api/offers/${ownOffer.id}`)
      .set("Cookie", ownerCookie)

    expect(res.status).toBe(200)
    expect(res.body.output).toEqual(
      createOfferPreview(validOfferInput, repricedCatalog),
    )
  })

  it("hides an offer owned by somebody else behind a 404", async () => {
    const { app, strangerOffer } = await setup()

    const res = await request(app)
      .get(`/api/offers/${strangerOffer.id}`)
      .set("Cookie", ownerCookie)

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: "Offer not found" })
  })

  it("lets an admin open an offer owned by somebody else", async () => {
    const { app, strangerOffer } = await setup()

    const res = await request(app)
      .get(`/api/offers/${strangerOffer.id}`)
      .set("Cookie", adminCookie)

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ id: strangerOffer.id, userId: strangerId })
  })

  it("saves the caller as the owner of a newly created offer", async () => {
    const { app, offers } = await setup()

    const res = await request(app)
      .post("/api/offers")
      .set("Cookie", ownerCookie)
      .send(validOfferInput)

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({ title: "Offer test", userId: ownerId })
    expect(offers.all()).toHaveLength(3)
  })

  it("updates an offer for the user who owns it", async () => {
    const { app, ownOffer } = await setup()

    const res = await request(app)
      .put(`/api/offers/${ownOffer.id}`)
      .set("Cookie", ownerCookie)
      .send({
        ...validOfferInput,
        expectedUpdatedAt: ownOffer.updatedAt.toISOString(),
        title: "Renamed by the owner",
      })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      id: ownOffer.id,
      title: "Renamed by the owner",
      userId: ownerId,
    })
  })

  it("refuses to overwrite an offer changed since the caller loaded it", async () => {
    const { app, offers, ownOffer } = await setup()

    const res = await request(app)
      .put(`/api/offers/${ownOffer.id}`)
      .set("Cookie", ownerCookie)
      .send({
        ...validOfferInput,
        expectedUpdatedAt: "2020-01-01T00:00:00.000Z",
        title: "Saved over a newer version",
      })

    expect(res.status).toBe(409)
    expect(res.body).toEqual({ error: "Offer was changed by somebody else" })
    expect(offers.all().map(({ title }) => title)).toEqual([
      "Owner offer",
      "Stranger offer",
    ])
  })

  it("refuses to update an offer owned by somebody else", async () => {
    const { app, offers, strangerOffer } = await setup()

    const res = await request(app)
      .put(`/api/offers/${strangerOffer.id}`)
      .set("Cookie", ownerCookie)
      .send({
        ...validOfferInput,
        expectedUpdatedAt: strangerOffer.updatedAt.toISOString(),
        title: "Renamed by a stranger",
      })

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: "Offer not found" })
    expect(offers.all().map(({ title }) => title)).toEqual([
      "Owner offer",
      "Stranger offer",
    ])
  })

  it("refuses to delete an offer owned by somebody else", async () => {
    const { app, offers, strangerOffer } = await setup()

    const res = await request(app)
      .delete(`/api/offers/${strangerOffer.id}`)
      .set("Cookie", ownerCookie)

    expect(res.status).toBe(404)
    expect(res.body).toEqual({ error: "Offer not found" })
    expect(offers.all()).toHaveLength(2)
  })

  it("deletes an offer for the user who owns it", async () => {
    const { app, offers, ownOffer, strangerOffer } = await setup()

    const res = await request(app)
      .delete(`/api/offers/${ownOffer.id}`)
      .set("Cookie", ownerCookie)

    expect(res.status).toBe(204)
    expect(offers.all().map(({ id }) => id)).toEqual([strangerOffer.id])
  })
})

describe("offer shared by an admin", () => {
  it("lets the user it is shared with list, open and update it", async () => {
    const { app, strangerOffer } = await setup()

    const share = await request(app)
      .put(`/api/offers/${strangerOffer.id}/shares`)
      .set("Cookie", adminCookie)
      .send({ userIds: [ownerId] })
    const list = await request(app)
      .get("/api/offers")
      .set("Cookie", ownerCookie)
    const update = await request(app)
      .put(`/api/offers/${strangerOffer.id}`)
      .set("Cookie", ownerCookie)
      .send({
        ...validOfferInput,
        expectedUpdatedAt: strangerOffer.updatedAt.toISOString(),
        title: "Renamed by a colleague",
      })

    expect(share.status).toBe(200)
    expect(list.body.map(({ id }: OfferSummary) => id)).toContain(
      strangerOffer.id,
    )
    expect(update.status).toBe(200)
    expect(update.body).toMatchObject({
      title: "Renamed by a colleague",
      userId: strangerId,
    })
  })

  it("records the colleague who last updated it", async () => {
    const { app, strangerOffer } = await setup()

    await request(app)
      .put(`/api/offers/${strangerOffer.id}/shares`)
      .set("Cookie", adminCookie)
      .send({ userIds: [ownerId] })
    await request(app)
      .put(`/api/offers/${strangerOffer.id}`)
      .set("Cookie", ownerCookie)
      .send({
        ...validOfferInput,
        expectedUpdatedAt: strangerOffer.updatedAt.toISOString(),
      })
    const list = await request(app)
      .get("/api/offers")
      .set("Cookie", adminCookie)

    expect(
      list.body.find(({ id }: OfferSummary) => id === strangerOffer.id),
    ).toMatchObject({
      authorEmail: `${strangerId}@example.com`,
      lastUpdatedByEmail: `${ownerId}@example.com`,
    })
  })

  it("tells an admin who an offer is shared with", async () => {
    const { app, strangerOffer } = await setup()

    await request(app)
      .put(`/api/offers/${strangerOffer.id}/shares`)
      .set("Cookie", adminCookie)
      .send({ userIds: [ownerId] })
    const res = await request(app)
      .get(`/api/offers/${strangerOffer.id}/shares`)
      .set("Cookie", adminCookie)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ userIds: [ownerId] })
  })

  it("refuses to let a non-admin share an offer", async () => {
    const { app, ownOffer } = await setup()

    const res = await request(app)
      .put(`/api/offers/${ownOffer.id}/shares`)
      .set("Cookie", ownerCookie)
      .send({ userIds: [strangerId] })

    expect(res.status).toBe(403)
    expect(res.body).toEqual({ error: "Forbidden" })
  })
})
