import * as v from "valibot"

import { RoleSchema } from "../user/User.schema"

// This is the payload we sign in the API (see login.controller.ts)
// plus standard JWT timestamp claims added by jsonwebtoken.
export const JwtPayloadSchema = v.object({
  sub: v.string(),
  email: v.string(),
  role: RoleSchema,
  iat: v.optional(v.number()),
  exp: v.optional(v.number()),
})

export type JwtPayload = v.InferOutput<typeof JwtPayloadSchema>
