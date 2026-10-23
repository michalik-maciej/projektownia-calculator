import { afterEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"

import { AddLayoutSlot } from "./AddLayoutSlot"

function renderSlot(onImportPdf: ((file: File) => void) | null) {
  render(
    <AddLayoutSlot
      onAddGondola={() => {}}
      onAddImpulse={() => {}}
      onAddItemSet={() => {}}
      onAddWall={() => {}}
      onImportPdf={onImportPdf}
    />,
  )
}

describe("AddLayoutSlot", () => {
  afterEach(cleanup)

  it("hands the chosen PDF to the import", () => {
    const imported: File[] = []
    renderSlot((file) => imported.push(file))
    const drawing = new File(["%PDF-1.4"], "sklep.pdf", {
      type: "application/pdf",
    })

    fireEvent.change(screen.getByLabelText("Importuj ciągi z PDF"), {
      target: { files: [drawing] },
    })

    expect(imported).toEqual([drawing])
  })

  it("opens the guide to preparing the PDF without starting the import", () => {
    const imported: File[] = []
    renderSlot((file) => imported.push(file))

    fireEvent.click(
      screen.getByRole("button", { name: "Jak przygotować plik PDF" }),
    )

    expect(
      screen.getByRole("dialog", {
        name: "Jak przygotować plik PDF do importu",
      }),
    ).toBeInTheDocument()
    expect(imported).toEqual([])
  })

  it("offers no PDF import to an account without it", () => {
    renderSlot(null)

    expect(
      screen.queryByLabelText("Importuj ciągi z PDF"),
    ).not.toBeInTheDocument()
  })
})
