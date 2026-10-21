import { randomUUID } from "node:crypto"
import { Offer, Prisma } from "@prisma/client"

import {
  CreateOfferInput,
  OfferScope,
  OfferStore,
  UpdateOfferInput,
} from "../db/offer.repository"

type TestOfferStore = OfferStore & { all: () => Offer[] }

function toStoredJson(value: Prisma.InputJsonValue): Prisma.JsonValue {
  return value as Prisma.JsonValue
}

function isVisibleTo(offer: Offer, scope: OfferScope): boolean {
  return scope.isAdmin || offer.userId === scope.userId
}

export function createInMemoryOfferStore(): TestOfferStore {
  const stored = new Map<string, Offer>()

  return {
    all: () => [...stored.values()],

    createOffer: async (data: CreateOfferInput) => {
      const offer: Offer = {
        createdAt: new Date(),
        discountPercentage: data.discountPercentage ?? null,
        id: randomUUID(),
        input: toStoredJson(data.input),
        title: data.title,
        userId: data.userId,
      }

      stored.set(offer.id, offer)
      return offer
    },

    deleteOffer: async (id: string) => {
      const offer = stored.get(id)

      if (!offer) {
        throw new Error(`No offer with id ${id}`)
      }

      stored.delete(id)
      return offer
    },

    getAllOffers: async (scope: OfferScope) =>
      [...stored.values()]
        .filter((offer) => isVisibleTo(offer, scope))
        .map(({ createdAt, id, title }) => ({ createdAt, id, title })),

    getOfferById: async (id: string, scope: OfferScope) => {
      const offer = stored.get(id)

      return offer && isVisibleTo(offer, scope) ? offer : null
    },

    updateOffer: async (data: UpdateOfferInput) => {
      const existing = stored.get(data.id)

      if (!existing) {
        throw new Error(`No offer with id ${data.id}`)
      }

      const updated: Offer = {
        ...existing,
        discountPercentage:
          data.discountPercentage ?? existing.discountPercentage,
        input:
          data.input === undefined ? existing.input : toStoredJson(data.input),
        title: data.title ?? existing.title,
      }

      stored.set(updated.id, updated)
      return updated
    },
  }
}
