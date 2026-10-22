import { describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router"
import { render, screen } from "@testing-library/react"

vi.stubEnv("VITE_API_URL", "http://localhost:3000")

const { InventoryItemDialog } = await import("./InventoryItemDialog")

describe("InventoryItemDialog", () => {
  it("shows a catalogue part read only to an employee", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity } },
    })
    queryClient.setQueryData(["auth", "user"], { user: { role: "USER" } })
    queryClient.setQueryData(
      ["inventory", "list"],
      [
        {
          category: "shelf",
          depth: 47,
          height: null,
          id: "1",
          label: "Półka 80/47",
          price: 25,
          width: 80,
        },
      ],
    )
    const router = createRouter({
      history: createMemoryHistory(),
      routeTree: createRootRoute({
        component: () => (
          <InventoryItemDialog componentId="1" onOpenChange={() => {}} />
        ),
      }),
    })

    render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    )

    expect(await screen.findByText("Podgląd elementu")).toBeInTheDocument()
    expect(screen.getByDisplayValue("Półka 80/47")).toBeDisabled()
    expect(
      screen.queryByRole("button", { name: "Zapisz" }),
    ).not.toBeInTheDocument()
  })
})
