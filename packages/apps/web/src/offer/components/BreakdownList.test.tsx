import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"

import { BreakdownList } from "./BreakdownList"

describe("BreakdownList", () => {
  it("lists groups as legs, feet, backs, shelves, supports, covers, other", () => {
    const item = (id: string) => [{ id, label: id, quantity: 1 }]

    const { container } = render(
      <BreakdownList
        breakdown={{
          back: item("back"),
          baseCover: item("baseCover"),
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
      "Inne",
    ])
  })
})
