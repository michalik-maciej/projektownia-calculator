import { FormProvider, useForm } from "react-hook-form"
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"

import { OfferInput } from "@/schemas/Offer.schema"

import { LayoutPlanHeader } from "./LayoutPlanHeader"

function Harness() {
  const form = useForm<OfferInput>({
    defaultValues: {
      discountPercentage: 0,
      layouts: [
        {
          depth: 37,
          height: 210,
          numberOfLayouts: 1,
          drawingRunNumber: 5,
          isExcludedFromOffer: true,
          shelfUnits: [],
        },
      ],
      title: "Oferta",
    },
  })

  return (
    <FormProvider {...form}>
      <LayoutPlanHeader
        isSelected={false}
        layoutIndex={0}
        onDuplicate={() => {}}
        onRemove={() => {}}
        preview={undefined}
      />
    </FormProvider>
  )
}

describe("LayoutPlanHeader", () => {
  afterEach(cleanup)

  it("lets a run read from a drawing be switched into the offer", () => {
    render(<Harness />)
    const inOffer = screen.getByRole("switch", { name: "Wliczaj do oferty" })

    expect(screen.getByText("PDF (5)")).toBeInTheDocument()
    expect(inOffer).not.toBeChecked()

    fireEvent.click(inOffer)

    expect(inOffer).toBeChecked()
    expect(screen.getByText("PDF (5)")).toBeInTheDocument()
  })
})
