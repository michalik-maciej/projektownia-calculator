import { Role, User } from "@prisma/client"

import { prisma } from "./prisma"

export const DEMO_ACCOUNT_TTL_HOURS = 24

export type UserSummary = Pick<User, "id" | "email" | "role">

export type UserStore = {
  createUser: (
    email: string,
    passwordHash: string,
    role?: Role,
  ) => Promise<User>
  deleteExpiredDemoAccounts: () => Promise<number>
  deleteUser: (id: string) => Promise<User>
  getUserByEmail: (email: string) => Promise<User | null>
  listUsers: () => Promise<UserSummary[]>
  updateUserPassword: (id: string, passwordHash: string) => Promise<User>
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } })
}

export async function createUser(
  email: string,
  passwordHash: string,
  role: Role = Role.USER,
): Promise<User> {
  return prisma.user.create({
    data: {
      email,
      password: passwordHash,
      role,
    },
  })
}

export async function listUsers(): Promise<UserSummary[]> {
  return prisma.user.findMany({
    where: { role: { not: Role.DEMO } },
    select: { id: true, email: true, role: true },
    orderBy: { email: "asc" },
  })
}

export async function deleteExpiredDemoAccounts(): Promise<number> {
  const cutoff = new Date(Date.now() - DEMO_ACCOUNT_TTL_HOURS * 60 * 60 * 1000)

  const expired = await prisma.user.findMany({
    where: { role: Role.DEMO, createdAt: { lt: cutoff } },
    select: { id: true },
  })

  if (expired.length === 0) {
    return 0
  }

  const ids = expired.map((user) => user.id)

  await prisma.$transaction([
    prisma.offer.deleteMany({ where: { userId: { in: ids } } }),
    prisma.user.deleteMany({ where: { id: { in: ids } } }),
  ])

  return ids.length
}

export async function deleteUser(id: string): Promise<User> {
  return prisma.user.delete({ where: { id } })
}

export async function updateUserPassword(
  id: string,
  passwordHash: string,
): Promise<User> {
  return prisma.user.update({
    where: { id },
    data: { password: passwordHash },
  })
}

export const userStore: UserStore = {
  createUser,
  deleteExpiredDemoAccounts,
  deleteUser,
  getUserByEmail,
  listUsers,
  updateUserPassword,
}
