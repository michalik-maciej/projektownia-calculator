import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

import { prisma } from "../src/db/prisma"

declare const process: {
  env: Record<string, string | undefined>
  exit(code?: number): never
}

const DEMO_USER = {
  email: "demo@example.com",
  password: "demo1234",
}

const PASSWORD_SALT_ROUNDS = 10

function databaseHost() {
  const url = process.env.DATABASE_URL

  if (!url) {
    throw new Error("Missing DATABASE_URL")
  }

  return new URL(url).hostname
}

async function seedDemoUser() {
  if (process.env.ALLOW_DEMO_SEED !== "1") {
    console.log("Skipped the demo account: ALLOW_DEMO_SEED is not set to 1.")
    return
  }

  await prisma.user.upsert({
    where: { email: DEMO_USER.email },
    update: {},
    create: {
      email: DEMO_USER.email,
      password: await bcrypt.hash(DEMO_USER.password, PASSWORD_SALT_ROUNDS),
      role: Role.USER,
    },
  })

  console.log(`Seeded the demo account ${DEMO_USER.email}.`)
}

async function seedComponents() {
  await prisma.component.createMany({
    data: [
      {
        category: "shelf",
        depth: 30,
        height: null,
        label: "Półka 66/30",
        price: 29.8,
        width: 66,
      },
      {
        category: "misc",
        depth: 3,
        height: 3,
        label: "Inne 3/1 mb/3",
        price: 50,
        width: 1,
      },
      {
        category: "foot",
        depth: 37,
        height: null,
        label: "Stopa 37",
        price: 44.39,
        width: null,
      },
      {
        category: "misc",
        depth: 3,
        height: 3,
        label: "Inne 3/240/3",
        price: 300,
        width: 240,
      },
      {
        category: "support",
        depth: 57,
        height: null,
        label: "Wspornik 57",
        price: 21.5,
        width: null,
      },
      {
        category: "shelf",
        depth: 47,
        height: null,
        label: "Półka 80/47",
        price: 64,
        width: 80,
      },
      {
        category: "support",
        depth: 67,
        height: null,
        label: "Wspornik 67",
        price: 26.5,
        width: null,
      },
      {
        category: "shelf",
        depth: 30,
        height: null,
        label: "Półka 100/30",
        price: 42,
        width: 100,
      },
      {
        category: "shelf",
        depth: 30,
        height: null,
        label: "Półka 80/30",
        price: 39,
        width: 80,
      },
      {
        category: "shelf",
        depth: 37,
        height: null,
        label: "Półka 100/37",
        price: 51.51,
        width: 100,
      },
      {
        category: "shelf",
        depth: 57,
        height: null,
        label: "Półka 125/57",
        price: 99.1,
        width: 125,
      },
      {
        category: "shelf",
        depth: 47,
        height: null,
        label: "Półka 125/47",
        price: 82.58,
        width: 125,
      },
      {
        category: "back",
        depth: null,
        height: 10,
        label: "Plecy 10/80",
        price: 15.48,
        width: 80,
      },
      {
        category: "back",
        depth: null,
        height: 30,
        label: "Plecy 30/80",
        price: 29.8,
        width: 80,
      },
      {
        category: "back",
        depth: null,
        height: 10,
        label: "Plecy 10/100",
        price: 16,
        width: 100,
      },
      {
        category: "back",
        depth: null,
        height: 20,
        label: "Plecy 20/100",
        price: 20.65,
        width: 100,
      },
      {
        category: "back",
        depth: null,
        height: 40,
        label: "Plecy 40/100",
        price: 34.07,
        width: 100,
      },
      {
        category: "back",
        depth: null,
        height: 20,
        label: "Plecy 20/125",
        price: 27.87,
        width: 125,
      },
      {
        category: "back",
        depth: null,
        height: 10,
        label: "Plecy 10/125",
        price: 18.58,
        width: 125,
      },
      {
        category: "back",
        depth: null,
        height: 40,
        label: "Plecy 40/125",
        price: 41.81,
        width: 125,
      },
      {
        category: "back",
        depth: null,
        height: 30,
        label: "Plecy 30/125",
        price: 36.9,
        width: 125,
      },
      {
        category: "priceStrip",
        depth: null,
        height: null,
        label: "Listwa cenowa 66",
        price: 2.3,
        width: 66,
      },
      {
        category: "priceStrip",
        depth: null,
        height: null,
        label: "Listwa cenowa 80",
        price: 2.25,
        width: 80,
      },
      {
        category: "priceStrip",
        depth: null,
        height: null,
        label: "Listwa cenowa 100",
        price: 2.2,
        width: 100,
      },
      {
        category: "priceStrip",
        depth: null,
        height: null,
        label: "Listwa cenowa 125",
        price: 2.1,
        width: 125,
      },
      {
        category: "baseCover",
        depth: null,
        height: null,
        label: "Osłona dolna 125",
        price: 41.22,
        width: 125,
      },
      {
        category: "baseCover",
        depth: null,
        height: null,
        label: "Osłona dolna 100",
        price: 38.22,
        width: 100,
      },
      {
        category: "leg",
        depth: 3,
        height: 130,
        label: "Noga 130/8/3",
        price: 98,
        width: 8,
      },
      {
        category: "leg",
        depth: 3,
        height: 170,
        label: "Noga 170/8/3",
        price: 108.39,
        width: 8,
      },
      {
        category: "baseCover",
        depth: null,
        height: null,
        label: "Osłona dolna 66",
        price: 32.11,
        width: 66,
      },
      {
        category: "baseCover",
        depth: null,
        height: null,
        label: "Osłona dolna 80",
        price: 36.13,
        width: 80,
      },
      {
        category: "foot",
        depth: 47,
        height: null,
        label: "Stopa 47",
        price: 52.13,
        width: null,
      },
      {
        category: "foot",
        depth: 57,
        height: null,
        label: "Stopa 57",
        price: 58.84,
        width: null,
      },
      {
        category: "leg",
        depth: 3,
        height: 180,
        label: "Noga 180/8/3",
        price: 115.62,
        width: 8,
      },
      {
        category: "support",
        depth: 47,
        height: null,
        label: "Wspornik 47",
        price: 15.38,
        width: null,
      },
      {
        category: "support",
        depth: 30,
        height: null,
        label: "Wspornik 30",
        price: 7.5,
        width: null,
      },
      {
        category: "support",
        depth: 37,
        height: null,
        label: "Wspornik 37",
        price: 9.6,
        width: null,
      },
      {
        category: "shelf",
        depth: 37,
        height: null,
        label: "Półka 80/37",
        price: 49.55,
        width: 80,
      },
      {
        category: "shelf",
        depth: 37,
        height: null,
        label: "Półka 66/37",
        price: 43.36,
        width: 66,
      },
      {
        category: "shelf",
        depth: 57,
        height: null,
        label: "Półka 80/57",
        price: 76.39,
        width: 80,
      },
      {
        category: "shelf",
        depth: 47,
        height: null,
        label: "Półka 100/47",
        price: 66.07,
        width: 100,
      },
      {
        category: "shelf",
        depth: 37,
        height: null,
        label: "Półka 125/37",
        price: 64.52,
        width: 125,
      },
      {
        category: "shelf",
        depth: 57,
        height: null,
        label: "Półka 100/57",
        price: 79.49,
        width: 100,
      },
      {
        category: "shelf",
        depth: 67,
        height: null,
        label: "Półka 100/67",
        price: 99.1,
        width: 100,
      },
      {
        category: "shelf",
        depth: 67,
        height: null,
        label: "Półka 80/67",
        price: 99.1,
        width: 80,
      },
      {
        category: "shelf",
        depth: 30,
        height: null,
        label: "Półka 125/30",
        price: 45,
        width: 125,
      },
      {
        category: "back",
        depth: null,
        height: 10,
        label: "Plecy 10/66",
        price: 14.45,
        width: 66,
      },
      {
        category: "back",
        depth: null,
        height: 40,
        label: "Plecy 40/66",
        price: 29.94,
        width: 66,
      },
      {
        category: "shelf",
        depth: 67,
        height: null,
        label: "Półka 125/67",
        price: 99.1,
        width: 125,
      },
      {
        category: "back",
        depth: null,
        height: 20,
        label: "Plecy 20/66",
        price: 18.58,
        width: 66,
      },
      {
        category: "back",
        depth: null,
        height: 30,
        label: "Plecy 30/66",
        price: 27.2,
        width: 66,
      },
      {
        category: "back",
        depth: null,
        height: 20,
        label: "Plecy 20/80",
        price: 19.72,
        width: 80,
      },
      {
        category: "back",
        depth: null,
        height: 40,
        label: "Plecy 40/80",
        price: 33.03,
        width: 80,
      },
      {
        category: "back",
        depth: null,
        height: 30,
        label: "Plecy 30/100",
        price: 31.1,
        width: 100,
      },
      {
        category: "leg",
        depth: 3,
        height: 210,
        label: "Noga 210/8/3",
        price: 138.33,
        width: 8,
      },
      {
        category: "leg",
        depth: 3,
        height: 90,
        label: "Noga 90/8/3",
        price: 58.9,
        width: 8,
      },
    ],
  })
}

async function main() {
  console.log(`Seeding ${databaseHost()}`)
  await seedComponents()
  await seedDemoUser()
}

main().catch((error) => {
  console.error("Seeding failed:", error)
  process.exit(1)
})
