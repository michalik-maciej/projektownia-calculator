import bcrypt from "bcryptjs"
import { Request, Response } from "express"
import * as v from "valibot"

import { LoginInputSchema } from "@/schemas/auth/Login.schema"
import type { User } from "@/schemas/user/User.schema"

import { createUser } from "../../db/user.repository"

type ErrorResponse = {
  error: string
  issues?: ReturnType<typeof v.flatten<typeof LoginInputSchema>>
}

export async function registerController(
  req: Request,
  res: Response<ErrorResponse | User>,
) {
  const { success, output, issues } = v.safeParse(LoginInputSchema, req.body)

  if (!success) {
    return res
      .status(400)
      .json({ error: "Invalid request body", issues: v.flatten(issues) })
  }

  const { email, password } = output
  try {
    const user = await createUser(email, await bcrypt.hash(password, 10))
    res.status(201).json({ id: user.id, email: user.email, role: user.role })
  } catch (error) {
    console.error("Failed to create user:", error)
    res.status(500).json({ error: "Failed to create user" })
  }
}
