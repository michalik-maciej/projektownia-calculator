import * as v from "valibot"

import { MIN_PASSWORD_LENGTH } from "../auth/Login.schema"

export const UserPasswordUpdateSchema = v.object({
  password: v.pipe(v.string(), v.minLength(MIN_PASSWORD_LENGTH)),
})

export type UserPasswordUpdateInput = v.InferInput<
  typeof UserPasswordUpdateSchema
>
