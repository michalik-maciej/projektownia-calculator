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

export type OfferSummaryRow = Pick<
  Offer,
  "createdAt" | "id" | "title" | "updatedAt"
> & {
  authorEmail: string
}

export type OfferStore = {
  createOffer: (data: CreateOfferInput) => Promise<Offer>
  deleteOffer: (id: string) => Promise<Offer>
  getAllOffers: (scope: OfferScope) => Promise<OfferSummaryRow[]>
  getOfferById: (id: string, scope: OfferScope) => Promise<Offer | null>
  getOfferShares: (offerId: string) => Promise<string[]>
  setOfferShares: (offerId: string, userIds: string[]) => Promise<void>
  updateOffer: (data: UpdateOfferInput) => Promise<Offer>
}

function accessFilter(scope: OfferScope): Prisma.OfferWhereInput {
  return scope.isAdmin
    ? {}
    : {
        OR: [
          { userId: scope.userId },
          { shares: { some: { userId: scope.userId } } },
        ],
      }
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
  const offers = await prisma.offer.findMany({
    where: accessFilter(scope),
    orderBy: { updatedAt: "desc" },
    select: {
      createdAt: true,
      id: true,
      title: true,
      updatedAt: true,
      user: { select: { email: true } },
    },
  })

  return offers.map(({ user, ...offer }) => ({
    ...offer,
    authorEmail: user.email,
  }))
}

export async function getOfferById(
  id: string,
  scope: OfferScope,
): Promise<Offer | null> {
  return prisma.offer.findFirst({ where: { id, ...accessFilter(scope) } })
}

export async function getOfferShares(offerId: string): Promise<string[]> {
  const shares = await prisma.offerShare.findMany({
    where: { offerId },
    select: { userId: true },
  })

  return shares.map(({ userId }) => userId)
}

export async function setOfferShares(
  offerId: string,
  userIds: string[],
): Promise<void> {
  await prisma.$transaction([
    prisma.offerShare.deleteMany({ where: { offerId } }),
    prisma.offerShare.createMany({
      data: userIds.map((userId) => ({ offerId, userId })),
    }),
  ])
}

export async function deleteOffer(id: string): Promise<Offer> {
  return prisma.offer.delete({ where: { id } })
}

export const offerStore: OfferStore = {
  createOffer,
  deleteOffer,
  getAllOffers,
  getOfferById,
  getOfferShares,
  setOfferShares,
  updateOffer,
}
