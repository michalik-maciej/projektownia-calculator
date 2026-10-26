import { describe, expect, it } from "vitest"
import { render, within } from "@testing-library/react"

import { BreakdownList } from "./BreakdownList"
import { formatPrice } from "../helpers/formatPrice"

describe("BreakdownList", () => {
  it("lists groups as legs, feet, backs, shelves, supports, covers, top covers, other", () => {
    const item = (id: string) => [{ basePrice: 0, id, label: id, quantity: 1 }]

    const { container } = render(
      <BreakdownList
        breakdown={{
          back: item("back"),
          baseCover: item("baseCover"),
          topCover: item("topCover"),
          foot: item("foot"),
          leg: item("leg"),
          misc: item("misc"),
          shelf: item("shelf"),
          support: item("support"),
        }}
      />,
    )

    expect(
      [...container.querySelectorAll("tbody th")].map((th) => th.textContent),
    ).toEqual([
      "Nogi",
      "Stopy",
      "Plecy",
      "Półki",
      "Wsporniki",
      "Osłony dolne",
      "Maskownice",
      "Inne",
    ])
  })

  it("shows each line at catalogue price and after the offer discount", () => {
    const { container } = render(
      <BreakdownList
        breakdown={{
          leg: [{ basePrice: 90, id: "leg", label: "Noga", quantity: 10 }],
        }}
        pricing={{ basePrice: 90, discountPercentage: 10, discountPrice: 81 }}
      />,
    )

    expect(
      within(container)
        .getAllByRole("cell")
        .slice(0, 4)
        .map((cell) => cell.textContent),
    ).toEqual(["Noga", "10", formatPrice(90), formatPrice(81)])
  })
})
