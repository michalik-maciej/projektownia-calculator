import { randomUUID } from "node:crypto"
import { Offer, Prisma } from "@prisma/client"

import {
  CreateOfferInput,
  OfferScope,
  OfferStore,
  UpdateOfferInput,
} from "../db/offer.repository"

type TestOfferStore = OfferStore & { all: () => Offer[] }

export function createInMemoryOfferStore(
  userAccountIds: string[] = [],
): TestOfferStore {
  const stored = new Map<string, Offer>()
  const sharedWith = new Map<string, string[]>()

  const isVisibleTo = (offer: Offer, scope: OfferScope): boolean =>
    scope.isAdmin ||
    offer.userId === scope.userId ||
    (sharedWith.get(offer.id) ?? []).includes(scope.userId)

  return {
    all: () => [...stored.values()],

    createOffer: async (data: CreateOfferInput) => {
      const offer: Offer = {
        createdAt: new Date(),
        discountPercentage: data.discountPercentage ?? null,
        id: randomUUID(),
        input: data.input as Prisma.JsonValue,
        lastUpdatedById: data.userId,
        title: data.title,
        updatedAt: new Date(),
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
        .map(
          ({ createdAt, id, lastUpdatedById, title, updatedAt, userId }) => ({
            authorEmail: `${userId}@example.com`,
            createdAt,
            id,
            lastUpdatedByEmail: lastUpdatedById
              ? `${lastUpdatedById}@example.com`
              : null,
            title,
            updatedAt,
          }),
        ),

    getOfferById: async (id: string, scope: OfferScope) => {
      const offer = stored.get(id)

      return offer && isVisibleTo(offer, scope) ? offer : null
    },

    getOfferShares: async (offerId: string) => sharedWith.get(offerId) ?? [],

    setOfferShares: async (offerId: string, userIds: string[]) => {
      if (!userIds.every((userId) => userAccountIds.includes(userId))) {
        return false
      }

      sharedWith.set(offerId, userIds)
      return true
    },

    updateOffer: async (data: UpdateOfferInput) => {
      const existing = stored.get(data.id)

      if (!existing) {
        throw new Error(`No offer with id ${data.id}`)
      }

      if (existing.updatedAt.getTime() !== data.expectedUpdatedAt.getTime()) {
        return null
      }

      const updated: Offer = {
        ...existing,
        discountPercentage:
          data.discountPercentage ?? existing.discountPercentage,
        input:
          data.input === undefined
            ? existing.input
            : (data.input as Prisma.JsonValue),
        lastUpdatedById: data.lastUpdatedById,
        title: data.title ?? existing.title,
        updatedAt: new Date(),
      }

      stored.set(updated.id, updated)
      return updated
    },
  }
}
