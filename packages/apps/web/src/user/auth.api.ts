import { AuthUserResponseSchema } from "@/schemas/auth/AuthUser.schema"
import { LoginInput, LoginResponseSchema } from "@/schemas/auth/Login.schema"

import {
  apiType,
  createApiMethod,
  isUnauthorized,
} from "../core/createMethod.api"

const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl) {
  throw new Error("Missing VITE_API_URL")
}

export const authApi = {
  login: createApiMethod({
    method: "POST",
    path: `${apiUrl}/auth/login`,
    response: LoginResponseSchema,
    data: apiType<LoginInput>(),
  }),
  demo: createApiMethod({
    method: "POST",
    path: `${apiUrl}/auth/demo`,
    response: LoginResponseSchema,
  }),
  logout: createApiMethod({
    method: "POST",
    path: `${apiUrl}/auth/logout`,
  }),
  register: createApiMethod({
    method: "POST",
    path: `${apiUrl}/auth/register`,
    data: apiType<LoginInput>(),
  }),
  user: createApiMethod({
    method: "GET",
    path: `${apiUrl}/auth/user`,
    response: AuthUserResponseSchema,
  }),
}

export const authQueries = {
  user: () => ({
    queryKey: ["auth", "user"] as const,
    queryFn: () => authApi.user(),
    retry: (failureCount: number, error: Error) =>
      !isUnauthorized(error) && failureCount < 3,
  }),
}
