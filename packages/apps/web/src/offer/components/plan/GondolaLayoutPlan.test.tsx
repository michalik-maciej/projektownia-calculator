import { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { afterEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react"

import { GondolaSide } from "@/schemas/LayoutGondola.schema"
import { OfferInput } from "@/schemas/Offer.schema"

import { LayoutPart } from "../../offer.types"

vi.stubEnv("VITE_API_URL", "http://localhost:3000")

const { GondolaLayoutPlan } = await import("./GondolaLayoutPlan")

const createSide = (width: number): GondolaSide => ({
  depth: 47,
  shelfUnits: [{ numberOfShelfUnits: 1, shelves: [], width }],
})

function Harness({ sides }: { sides: [GondolaSide, GondolaSide] }) {
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
      layouts: [{ height: 130, numberOfLayouts: 1, sides }],
      title: "Oferta",
    },
  })
  const [selection, setSelection] = useState<{
    part: LayoutPart
    unitIndex: number | null
  }>({ part: "middle", unitIndex: null })

  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider {...form}>
        <GondolaLayoutPlan
          layoutIndex={0}
          onDuplicate={() => {}}
          onRemove={() => {}}
          onSelectShelf={() => {}}
          onSelectTab={() => {}}
          onSelectUnit={(unitIndex, part = "middle") =>
            setSelection({ part, unitIndex })
          }
          panelTab="edit"
          preview={undefined}
          selectedPart={selection.part}
          selectedShelfIndex={0}
          selectedUnitIndex={selection.unitIndex}
        />
      </FormProvider>
    </QueryClientProvider>
  )
}

const unitsOnPlan = (width: number) =>
  screen.queryAllByRole("button", { name: new RegExp(`^${width}/47/130`) })

describe("GondolaLayoutPlan", () => {
  afterEach(cleanup)

  it("copies changes to the second side while the sides are linked", () => {
    render(<Harness sides={[createSide(80), createSide(80)]} />)

    fireEvent.click(unitsOnPlan(80)[1]!)
    expect(
      screen.getByText("Zmiany dotyczą obu stron gondoli."),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Dodaj regały" }))

    expect(unitsOnPlan(80)).toHaveLength(4)
  })

  it("edits the second side alone once the gondola is unlinked", () => {
    render(<Harness sides={[createSide(80), createSide(80)]} />)

    fireEvent.click(unitsOnPlan(80)[0]!)
    fireEvent.click(screen.getByRole("button", { name: "Rozłącz gondolę" }))
    fireEvent.click(unitsOnPlan(80)[1]!)

    expect(screen.getByText("Edytujesz stronę 2.")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Dodaj regały" }))

    expect(unitsOnPlan(80)).toHaveLength(3)
  })

  it("opens a gondola with different sides unlinked", () => {
    render(<Harness sides={[createSide(80), createSide(100)]} />)

    fireEvent.click(unitsOnPlan(100)[0]!)

    expect(screen.getByText("Edytujesz stronę 2.")).toBeInTheDocument()
    expect(unitsOnPlan(80)).toHaveLength(1)
  })

  it("replaces the second side with the first when the sides are linked again", () => {
    render(<Harness sides={[createSide(80), createSide(100)]} />)

    fireEvent.click(unitsOnPlan(100)[0]!)
    fireEvent.click(screen.getByRole("button", { name: "Połącz strony" }))
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Połącz strony",
      }),
    )

    expect(unitsOnPlan(100)).toHaveLength(0)
    expect(unitsOnPlan(80)).toHaveLength(2)
  })

  it("warns about the legs when the sides have different unit layouts", () => {
    render(<Harness sides={[createSide(80), createSide(100)]} />)

    expect(screen.getByRole("status")).toHaveTextContent(
      `Strony mają różny układ regałów. Sprawdź liczbę nóg i dostosuj je w sekcji "Opcje > Inne elementy".`,
    )
  })

  it("shows no leg warning when both sides share a unit layout", () => {
    render(<Harness sides={[createSide(80), createSide(80)]} />)

    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })
})
