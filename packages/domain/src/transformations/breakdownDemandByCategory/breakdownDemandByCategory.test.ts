import { describe, expect, it } from "vitest"

import { breakdownDemandByCategory } from "./breakdownDemandByCategory"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("breakdownDemandByCategory", () => {
  it("groups raw demand by product category", () => {
    const result = breakdownDemandByCategory(
      [
        { id: "back-40-80", quantity: 3 },
        { id: "shelf-80-37", quantity: 1 },
        { id: "shelf-100-47", quantity: 1 },
      ],
      componentCatalogMock,
    )

    expect(result).toEqual({
      back: [
        {
          id: "back-40-80",
          label: "Plecy 40/80",
          quantity: 3,
        },
      ],
      shelf: [
        {
          id: "shelf-80-37",
          label: "Półka 80/37",
          quantity: 1,
        },
        {
          id: "shelf-100-47",
          label: "Półka 100/47",
          quantity: 1,
        },
      ],
    })
  })

  it("orders the items of each category by size", () => {
    const result = breakdownDemandByCategory(
      [
        { id: "shelf-100-47", quantity: 1 },
        { id: "shelf-80-37", quantity: 1 },
      ],
      componentCatalogMock,
    )

    expect(result.shelf?.map(({ id }) => id)).toEqual([
      "shelf-80-37",
      "shelf-100-47",
    ])
  })

  it("throws an error when a component id is not found in the inventory", () => {
    expect(() =>
      breakdownDemandByCategory(
        [{ id: "unknown-component", quantity: 2 }],
        componentCatalogMock,
      ),
    ).toThrowError(
      'Component with id "unknown-component" not found in inventory',
    )
  })
})
