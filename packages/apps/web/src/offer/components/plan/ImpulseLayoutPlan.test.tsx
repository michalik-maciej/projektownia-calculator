import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { afterEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"

import { OfferInput } from "@/schemas/Offer.schema"

vi.stubEnv("VITE_API_URL", "http://localhost:3000")

const { ImpulseLayoutPlan } = await import("./ImpulseLayoutPlan")

function Harness() {
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity } },
    })
    client.setQueryData(["inventory", "list"], [])
    return client
  })
  const form = useForm<OfferInput>({
    defaultValues: {
      discountPercentage: 0,
      layouts: [
        {
          backDepth: 47,
          backVariant: 2,
          baseCoverVariant: 1,
          bays: [{ backShelves: [], frontShelves: 3, height: 90, width: 80 }],
          numberOfLayouts: 1,
        },
      ],
      title: "Oferta",
    },
  })
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number | null>(
    null,
  )

  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider {...form}>
        <ImpulseLayoutPlan
          layoutIndex={0}
          onDuplicate={() => {}}
          onRemove={() => {}}
          onSelectShelf={() => {}}
          onSelectTab={() => {}}
          onSelectUnit={setSelectedUnitIndex}
          panelTab="edit"
          preview={undefined}
          selectedShelfIndex={0}
          selectedUnitIndex={selectedUnitIndex}
        />
      </FormProvider>
    </QueryClientProvider>
  )
}

describe("ImpulseLayoutPlan", () => {
  afterEach(cleanup)

  it("restores the high impulse shelf defaults when a bay is made high", () => {
    render(<Harness />)

    fireEvent.click(screen.getByRole("button", { name: /^80\/30\/90/ }))
    fireEvent.click(screen.getByRole("button", { name: "Wysoki 130" }))

    expect(
      screen.getByRole("button", { name: /^80\/30\/130\s*5×30$/ }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /^80\/47\/130\s*1×47$/ }),
    ).toBeInTheDocument()
  })
})
