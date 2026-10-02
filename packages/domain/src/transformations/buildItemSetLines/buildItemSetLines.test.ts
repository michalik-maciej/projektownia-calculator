import { describe, expect, it } from "vitest"

import { buildItemSetLines } from "./buildItemSetLines"
import { componentCatalogMock } from "../../fixtures/componentCatalog"
import { MissingComponentError } from "../../models/missingComponentError"

describe("buildItemSetLines", () => {
  it("prices and describes every item of the set on its own line", () => {
    const lines = buildItemSetLines(
      {
        items: [
          { id: "foot-37", quantity: 2 },
          { id: "misc-inne-3-240-3", quantity: 1 },
        ],
      },
      componentCatalogMock,
    )

    expect(lines).toEqual([
      { basePrice: 88.78, description: "stopa 37 x2" },
      { basePrice: 300, description: "inne 3/240/3 x1" },
    ])
  })

  it("throws when an item is missing from the inventory", () => {
    expect(() =>
      buildItemSetLines(
        { items: [{ id: "gone-component", quantity: 1 }] },
        componentCatalogMock,
      ),
    ).toThrow(MissingComponentError)
  })
})
