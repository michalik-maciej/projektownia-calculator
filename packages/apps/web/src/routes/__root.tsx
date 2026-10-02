import { lazy, Suspense } from "react"
import type { QueryClient } from "@tanstack/react-query"
import {
  createRootRouteWithContext,
  Outlet,
  redirect,
} from "@tanstack/react-router"

import { RouteError } from "../app/RouteError"
import { RouteNotFound } from "../app/RouteNotFound"
import { isUnauthorized } from "../core/createMethod.api"
import { AppLayout } from "../layout/AppLayout"
import { OfferFormProvider } from "../offer/components/OfferFormProvider"
import { authQueries } from "../user/auth.api"

type RouterContext = {
  queryClient: QueryClient
}

export type OfferSearch = {
  offerId?: string
}

const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/router-devtools").then((module) => ({
        default: module.TanStackRouterDevtools,
      })),
    )
  : () => null

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ context: { queryClient }, location }) => {
    if (location.pathname === "/login") return

    try {
      await queryClient.ensureQueryData(authQueries.user())
    } catch (error) {
      if (isUnauthorized(error)) throw redirect({ to: "/login" })
      throw error
    }
  },
  validateSearch: (search: Record<string, unknown>): OfferSearch => ({
    offerId: typeof search.offerId === "string" ? search.offerId : undefined,
  }),
  component: () => (
    <>
      <OfferFormProvider>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </OfferFormProvider>
      <Suspense fallback={null}>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  ),
  errorComponent: ({ error }) => <RouteError error={error} />,
  notFoundComponent: () => <RouteNotFound />,
})
