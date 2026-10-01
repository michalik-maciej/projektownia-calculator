import * as v from "valibot"

export const LoginInputSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
})

export const LoginResponseSchema = v.object({
  user: v.object({
    id: v.string(),
    email: v.string(),
    role: v.string(),
  }),
})

export const DemoLoginResponseSchema = v.object({
  ...LoginResponseSchema.entries,
  exampleOfferId: v.optional(v.string()),
})

export type LoginInput = v.InferInput<typeof LoginInputSchema>
