import bcrypt from "bcryptjs"
import { Request, Response } from "express"
import { randomUUID } from "node:crypto"
import { Role } from "@prisma/client"

import { demoExampleOffer } from "./demoExampleOffer"
import { issueSession } from "./issueSession"
import { OfferStore } from "../../db/offer.repository"
import { UserStore } from "../../db/user.repository"
import { InventorySource } from "../offer/calculateOffer.controller"
import { priceOffer } from "../offer/priceOffer"

const DEMO_EMAIL_DOMAIN = "projektownia.app"
const PASSWORD_SALT_ROUNDS = 10

export function demoLoginController({
  createOffer,
  createUser,
  deleteExpiredDemoAccounts,
  getInventory,
}: Pick<UserStore, "createUser" | "deleteExpiredDemoAccounts"> &
  Pick<OfferStore, "createOffer"> & { getInventory: InventorySource }) {
  return async (_req: Request, res: Response) => {
    const secret = process.env.JWT_SECRET

    if (!secret) {
      console.error("Missing JWT_SECRET")
      return res.status(500).json({ error: "Server misconfigured" })
    }

    try {
      await deleteExpiredDemoAccounts().catch((error: unknown) => {
        console.error("Demo account cleanup failed:", error)
      })

      const user = await createUser(
        `demo+${randomUUID()}@${DEMO_EMAIL_DOMAIN}`,
        await bcrypt.hash(randomUUID(), PASSWORD_SALT_ROUNDS),
        Role.DEMO,
      )

      await seedExampleOffer({ createOffer, getInventory, userId: user.id })

      return res.status(200).json({
        user: issueSession(
          res,
          { email: user.email, id: user.id, role: user.role },
          secret,
        ),
      })
    } catch (error) {
      console.error("Demo sign-in failed:", error)
      return res.status(500).json({ error: "Demo sign-in failed" })
    }
  }
}

async function seedExampleOffer({
  createOffer,
  getInventory,
  userId,
}: Pick<OfferStore, "createOffer"> & {
  getInventory: InventorySource
  userId: string
}) {
  try {
    const inventory = await getInventory()
    const { output } = priceOffer(demoExampleOffer, inventory)

    await createOffer({
      title: demoExampleOffer.title,
      discountPercentage: demoExampleOffer.discountPercentage,
      input: demoExampleOffer,
      output: output ?? undefined,
      userId,
    })
  } catch (error) {
    console.error("Seeding the demo account's example offer failed:", error)
  }
}
