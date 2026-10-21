import { afterEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, render, screen } from "@testing-library/react"

vi.stubEnv("VITE_API_URL", "http://localhost:3000")

const { InventoryItemPriceField } = await import("./InventoryItemPriceField")

describe("InventoryItemPriceField", () => {
  afterEach(cleanup)

  it("shows a whole-number price with two decimal places", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity } },
    })
    queryClient.setQueryData(["auth", "user"], { user: { role: "USER" } })

    render(
      <QueryClientProvider client={queryClient}>
        <InventoryItemPriceField
          item={{
            category: "shelf",
            depth: null,
            height: null,
            id: "1",
            label: "Półka",
            price: 25,
            width: null,
          }}
        />
      </QueryClientProvider>,
    )

    expect(screen.getByRole("spinbutton", { name: "Cena" })).toHaveDisplayValue(
      "25.00",
    )
  })
})
