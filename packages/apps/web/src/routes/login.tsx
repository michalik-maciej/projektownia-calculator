import { createFileRoute, redirect } from "@tanstack/react-router"

import { isUnauthorized } from "../core/createMethod.api"
import { authQueries } from "../user/auth.api"
import { LoginForm } from "../user/components/LoginForm"

export const Route = createFileRoute("/login")({
  loader: async ({ context: { queryClient } }) => {
    const user = await queryClient
      .ensureQueryData(authQueries.user())
      .then((data) => data.user)
      .catch((error: unknown) => {
        if (!isUnauthorized(error)) {
          console.error("Checking the auth status failed:", error)
        }
        return null
      })

    if (user) {
      throw redirect({ to: "/" })
    }
  },
  component: LoginForm,
})
