import { describe, expect, it } from "vitest"

import { calculateRunSideDemand } from "./calculateRunSideDemand"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("calculateRunSideDemand", () => {
  it("returns the demand of one side without its uprights", () => {
    const result = calculateRunSideDemand(
      {
        depth: 47,
        hasBaseCover: true,
        height: 130,
        numberOfLayouts: 2,
        shelfUnits: [
          {
            numberOfShelfUnits: 2,
            shelves: [{ depth: 37, numberOfShelves: 1 }],
            width: 80,
          },
        ],
      },
      componentCatalogMock,
    )

    expect(result).toEqual([
      { id: "back-40-80", quantity: 12 },
      { id: "base-cover-80", quantity: 4 },
      { id: "shelf-80-47", quantity: 4 },
      { id: "shelf-80-37", quantity: 4 },
      { id: "support-37", quantity: 8 },
      { id: "foot-47", quantity: 6 },
    ])
  })
})
