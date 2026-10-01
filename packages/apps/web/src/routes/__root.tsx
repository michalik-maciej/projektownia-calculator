import { lazy, Suspense } from "react"
import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"

import { RouteError } from "../app/RouteError"
import { RouteNotFound } from "../app/RouteNotFound"
import { AppLayout } from "../layout/AppLayout"
import { OfferFormProvider } from "../offer/components/OfferFormProvider"

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
