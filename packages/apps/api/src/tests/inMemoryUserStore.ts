import { randomUUID } from "node:crypto"
import { Prisma, Role, User } from "@prisma/client"

import {
  DEMO_ACCOUNT_TTL_HOURS,
  UserStore,
  UserSummary,
} from "../db/user.repository"

type TestUserStore = UserStore & {
  all: () => User[]
  markAsHavingOffers: (id: string) => void
}

function notFoundError() {
  return new Prisma.PrismaClientKnownRequestError("Record not found", {
    code: "P2025",
    clientVersion: "test",
  })
}

export function createInMemoryUserStore(): TestUserStore {
  const stored = new Map<string, User>()
  const withOffers = new Set<string>()

  return {
    all: () => [...stored.values()],

    markAsHavingOffers: (id: string) => {
      withOffers.add(id)
    },

    createUser: async (
      email: string,
      passwordHash: string,
      role: Role = Role.USER,
    ) => {
      const user: User = {
        createdAt: new Date(),
        email,
        id: randomUUID(),
        password: passwordHash,
        role,
      }

      stored.set(user.id, user)
      return user
    },

    deleteExpiredDemoAccounts: async () => {
      const cutoff = Date.now() - DEMO_ACCOUNT_TTL_HOURS * 60 * 60 * 1000
      const expired = [...stored.values()].filter(
        (user) => user.role === Role.DEMO && user.createdAt.getTime() < cutoff,
      )

      for (const user of expired) {
        stored.delete(user.id)
        withOffers.delete(user.id)
      }

      return expired.length
    },

    deleteUser: async (id: string) => {
      const user = stored.get(id)

      if (!user) {
        throw notFoundError()
      }

      if (withOffers.has(id)) {
        throw new Prisma.PrismaClientKnownRequestError(
          "Foreign key constraint failed",
          { code: "P2003", clientVersion: "test" },
        )
      }

      stored.delete(id)
      return user
    },

    getUserByEmail: async (email: string) =>
      [...stored.values()].find((user) => user.email === email) ?? null,

    listUsers: async (): Promise<UserSummary[]> =>
      [...stored.values()]
        .filter((user) => user.role !== Role.DEMO)
        .map(({ id, email, role }) => ({ id, email, role }))
        .sort((a, b) => a.email.localeCompare(b.email)),

    updateUserPassword: async (id: string, passwordHash: string) => {
      const user = stored.get(id)

      if (!user) {
        throw notFoundError()
      }

      const updated = { ...user, password: passwordHash }
      stored.set(id, updated)
      return updated
    },
  }
}
