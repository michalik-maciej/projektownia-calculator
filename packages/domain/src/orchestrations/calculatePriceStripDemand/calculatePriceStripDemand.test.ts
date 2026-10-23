import { describe, expect, it } from "vitest"

import { calculatePriceStripDemand } from "./calculatePriceStripDemand"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("calculatePriceStripDemand", () => {
  it("orders one strip per shelf, base shelves included, matched on width", () => {
    const result = calculatePriceStripDemand(
      [
        {
          depth: 47,
          height: 210,
          numberOfLayouts: 1,
          shelfUnits: [
            {
              numberOfShelfUnits: 5,
              shelves: [{ depth: 37, numberOfShelves: 4 }],
              width: 80,
            },
            { numberOfShelfUnits: 2, shelves: [], width: 125 },
          ],
        },
      ],
      componentCatalogMock,
    )

    expect(result).toEqual([
      { id: "price-strip-80", quantity: 25 },
      { id: "price-strip-125", quantity: 2 },
    ])
  })

  it("counts the base shelves and hanging shelves of both impulse sides", () => {
    const result = calculatePriceStripDemand(
      [
        {
          backDepth: 47,
          backVariant: 2,
          baseCoverVariant: 1,
          bays: [
            {
              backShelves: [{ depth: 47, numberOfShelves: 1 }],
              frontShelves: 2,
              height: 90,
              width: 80,
            },
          ],
          numberOfLayouts: 1,
        },
      ],
      componentCatalogMock,
    )

    expect(result).toEqual([{ id: "price-strip-80", quantity: 5 }])
  })
})
