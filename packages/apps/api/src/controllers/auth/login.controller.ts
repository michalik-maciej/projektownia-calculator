import bcrypt from "bcryptjs"
import { Request, Response } from "express"
import * as v from "valibot"

import { LoginInputSchema } from "@/schemas/auth/Login.schema"

import { issueSession } from "./issueSession"
import { UserStore } from "../../db/user.repository"

type LoginResponse = {
  user: {
    id: string
    email: string
    role: string
  }
}

type ErrorResponse = {
  error: string
  issues?: ReturnType<typeof v.flatten<typeof LoginInputSchema>>
}

export function loginController({
  getUserByEmail,
}: Pick<UserStore, "getUserByEmail">) {
  return async (req: Request, res: Response<LoginResponse | ErrorResponse>) => {
    const { issues, output, success } = v.safeParse(LoginInputSchema, req.body)

    if (!success) {
      return res.status(400).json({
        error: "Invalid login payload",
        issues: v.flatten(issues),
      })
    }

    const secret = process.env.JWT_SECRET
    if (!secret) {
      return res.status(500).json({ error: "Server misconfigured" })
    }

    const user = await getUserByEmail(output.email)
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const hasPasswordMatch = await bcrypt.compare(
      output.password,
      user.password,
    )

    if (!hasPasswordMatch) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    return res.status(200).json({
      user: issueSession(
        res,
        { email: user.email, id: user.id, role: user.role },
        secret,
      ),
    })
  }
}
