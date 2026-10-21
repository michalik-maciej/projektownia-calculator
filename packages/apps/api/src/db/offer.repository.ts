import { Offer, Prisma } from "@prisma/client"

import { prisma } from "./prisma"

export type OfferScope = {
  isAdmin: boolean
  userId: string
}

export type CreateOfferInput = {
  title: string
  discountPercentage?: number
  input: Prisma.InputJsonValue
  userId: string
}

export type UpdateOfferInput = Omit<Partial<CreateOfferInput>, "userId"> & {
  id: string
}

export type OfferSummaryRow = Pick<Offer, "createdAt" | "id" | "title">

export type OfferStore = {
  createOffer: (data: CreateOfferInput) => Promise<Offer>
  deleteOffer: (id: string) => Promise<Offer>
  getAllOffers: (scope: OfferScope) => Promise<OfferSummaryRow[]>
  getOfferById: (id: string, scope: OfferScope) => Promise<Offer | null>
  updateOffer: (data: UpdateOfferInput) => Promise<Offer>
}

function ownerFilter(scope: OfferScope) {
  return scope.isAdmin ? {} : { userId: scope.userId }
}

export async function createOffer(data: CreateOfferInput): Promise<Offer> {
  return prisma.offer.create({ data })
}

export async function updateOffer(data: UpdateOfferInput): Promise<Offer> {
  const { id, ...update } = data

  return prisma.offer.update({
    where: { id },
    data: update,
  })
}

export async function getAllOffers(
  scope: OfferScope,
): Promise<OfferSummaryRow[]> {
  return prisma.offer.findMany({
    where: ownerFilter(scope),
    select: {
      createdAt: true,
      id: true,
      title: true,
    },
  })
}

export async function getOfferById(
  id: string,
  scope: OfferScope,
): Promise<Offer | null> {
  return prisma.offer.findFirst({ where: { id, ...ownerFilter(scope) } })
}

export async function deleteOffer(id: string): Promise<Offer> {
  return prisma.offer.delete({ where: { id } })
}

export const offerStore: OfferStore = {
  createOffer,
  deleteOffer,
  getAllOffers,
  getOfferById,
  updateOffer,
}
