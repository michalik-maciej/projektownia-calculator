import { describe, expect, it } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"

import { ConfirmDialog } from "./confirm-dialog"

describe("ConfirmDialog", () => {
  it("shows the title and description when open", () => {
    render(
      <ConfirmDialog
        confirmLabel="Usuń ofertę"
        description="Usunięcia zapisanej oferty nie da się cofnąć."
        onConfirm={() => {}}
        onOpenChange={() => {}}
        open
        title="Usunąć ofertę?"
      />,
    )

    expect(screen.getByText("Usunąć ofertę?")).toBeInTheDocument()
    expect(
      screen.getByText("Usunięcia zapisanej oferty nie da się cofnąć."),
    ).toBeInTheDocument()
  })

  it("calls onConfirm when the confirm button is clicked", () => {
    let confirmCalls = 0

    render(
      <ConfirmDialog
        confirmLabel="Usuń ofertę"
        description="Usunięcia zapisanej oferty nie da się cofnąć."
        onConfirm={() => {
          confirmCalls += 1
        }}
        onOpenChange={() => {}}
        open
        title="Usunąć ofertę?"
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "Usuń ofertę" }))

    expect(confirmCalls).toBe(1)
  })

  it("calls onOpenChange with false when cancelled", () => {
    const openChangeCalls: boolean[] = []

    render(
      <ConfirmDialog
        confirmLabel="Usuń ofertę"
        description="Usunięcia zapisanej oferty nie da się cofnąć."
        onConfirm={() => {}}
        onOpenChange={(open) => openChangeCalls.push(open)}
        open
        title="Usunąć ofertę?"
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "Anuluj" }))

    expect(openChangeCalls).toEqual([false])
  })
})
