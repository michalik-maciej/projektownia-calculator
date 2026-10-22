import { describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { render, screen } from "@testing-library/react"

vi.stubEnv("VITE_API_URL", "http://127.0.0.1:9")

const { Route: rootRoute } = await import("../routes/__root")

describe("root route", () => {
  it("shows an error page when the session check fails for another reason than a missing login", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retryDelay: 0 } },
    })
    const router = createRouter({
      context: { queryClient },
      history: createMemoryHistory({ initialEntries: ["/offer"] }),
      routeTree: rootRoute,
    })

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    )

    expect(
      await screen.findByRole("heading", { name: "Coś poszło nie tak" }),
    ).toBeInTheDocument()
  })
})
