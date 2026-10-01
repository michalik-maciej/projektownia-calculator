import bcrypt from "bcryptjs"
import { Request, Response } from "express"
import { randomUUID } from "node:crypto"
import { Role } from "@prisma/client"

import { issueSession } from "./issueSession"
import { UserStore } from "../../db/user.repository"

const DEMO_EMAIL_DOMAIN = "projektownia.app"
const PASSWORD_SALT_ROUNDS = 10

export function demoLoginController({
  createUser,
  deleteExpiredDemoAccounts,
}: Pick<UserStore, "createUser" | "deleteExpiredDemoAccounts">) {
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
