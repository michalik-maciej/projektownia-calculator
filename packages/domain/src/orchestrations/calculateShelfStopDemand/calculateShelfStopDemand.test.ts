import { describe, expect, it } from "vitest"

import { calculateShelfStopDemand } from "./calculateShelfStopDemand"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("calculateShelfStopDemand", () => {
  it("orders stops for the given share of shelves of each width, rounded up", () => {
    const result = calculateShelfStopDemand(
      [
        {
          depth: 47,
          height: 210,
          numberOfLayouts: 1,
          shelfUnits: [
            { numberOfShelfUnits: 10, shelves: [], width: 80 },
            {
              numberOfShelfUnits: 4,
              shelves: [{ depth: 37, numberOfShelves: 3 }],
              width: 100,
            },
          ],
        },
      ],
      20,
      componentCatalogMock,
    )

    expect(result).toEqual([
      { id: "shelf-stop-80", quantity: 2 },
      { id: "shelf-stop-100", quantity: 4 },
    ])
  })
})
