import { Offer, Prisma, Role } from "@prisma/client"

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
  expectedUpdatedAt: Date
  id: string
  lastUpdatedById: string
}

export type OfferSummaryRow = Pick<
  Offer,
  "createdAt" | "id" | "title" | "updatedAt"
> & {
  authorEmail: string
  lastUpdatedByEmail: string | null
}

export type OfferStore = {
  createOffer: (data: CreateOfferInput) => Promise<Offer>
  deleteOffer: (id: string) => Promise<Offer>
  getAllOffers: (scope: OfferScope) => Promise<OfferSummaryRow[]>
  getOfferById: (id: string, scope: OfferScope) => Promise<Offer | null>
  getOfferShares: (offerId: string) => Promise<string[]>
  setOfferShares: (offerId: string, userIds: string[]) => Promise<boolean>
  updateOffer: (data: UpdateOfferInput) => Promise<Offer | null>
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
  return prisma.offer.create({
    data: { ...data, lastUpdatedById: data.userId },
  })
}

export async function updateOffer(
  data: UpdateOfferInput,
): Promise<Offer | null> {
  const { expectedUpdatedAt, id, ...update } = data

  const { count } = await prisma.offer.updateMany({
    where: { id, updatedAt: expectedUpdatedAt },
    data: update,
  })

  return count === 0 ? null : prisma.offer.findUniqueOrThrow({ where: { id } })
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
      lastUpdatedBy: { select: { email: true } },
    },
  })

  return offers.map(({ lastUpdatedBy, user, ...offer }) => ({
    ...offer,
    authorEmail: user.email,
    lastUpdatedByEmail: lastUpdatedBy?.email ?? null,
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
): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const shareableCount = await tx.user.count({
      where: { id: { in: userIds }, role: Role.USER },
    })

    if (shareableCount !== userIds.length) {
      return false
    }

    await tx.offerShare.deleteMany({ where: { offerId } })
    await tx.offerShare.createMany({
      data: userIds.map((userId) => ({ offerId, userId })),
    })

    return true
  })
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
