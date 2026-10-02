import { toast } from "sonner"
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query"
import { createRouter, RouterProvider } from "@tanstack/react-router"

import { Providers } from "./Providers"
import { isUnauthorized } from "../core/createMethod.api"
import { routeTree } from "../routeTree.gen"
import { authQueries } from "../user/auth.api"
import { createSignOutOnUnauthorized } from "../user/helpers/createSignOutOnUnauthorized"

const MAX_QUERY_RETRIES = 3
const SESSION_EXPIRED_TOAST_ID = "session-expired"

const signOutOnUnauthorized = createSignOutOnUnauthorized({
  getPathname: () => router.state.location.pathname,
  signOut: () => {
    const hadSession =
      queryClient.getQueryData(authQueries.user().queryKey) !== undefined

    queryClient.clear()

    if (hadSession) {
      toast.error("Sesja wygasła. Zaloguj się ponownie.", {
        id: SESSION_EXPIRED_TOAST_ID,
        position: "top-center",
      })
    }

    void router.navigate({ to: "/login" })
  },
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) =>
        !isUnauthorized(error) && failureCount < MAX_QUERY_RETRIES,
    },
  },
  mutationCache: new MutationCache({ onError: signOutOnUnauthorized }),
  queryCache: new QueryCache({ onError: signOutOnUnauthorized }),
})

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

export function App() {
  return (
    <Providers queryClient={queryClient}>
      <RouterProvider router={router} />
    </Providers>
  )
}
