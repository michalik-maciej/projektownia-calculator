import { describe, expect, it } from "vitest"

import { calculateCoverDemand } from "./calculateCoverDemand"
import { componentCatalogMock } from "../../fixtures/componentCatalog"
import { MissingComponentError } from "../../models/missingComponentError"

describe("calculateCoverDemand", () => {
  it("orders one cover of the given category per shelf unit, matched on width", () => {
    const result = calculateCoverDemand(
      {
        category: "topCover",
        shelfUnitsByWidth: [
          {
            width: 100,
            numberOfShelfUnits: 2,
          },
          {
            width: 80,
            numberOfShelfUnits: 1,
          },
        ],
      },
      componentCatalogMock,
    )

    expect(result).toEqual([
      { id: "top-cover-100", quantity: 2 },
      { id: "top-cover-80", quantity: 1 },
    ])
  })

  it("throws if no cover of the given category matches the width", () => {
    expect(() =>
      calculateCoverDemand(
        {
          category: "baseCover",
          shelfUnitsByWidth: [
            {
              width: 16,
              numberOfShelfUnits: 1,
            },
          ],
        },
        componentCatalogMock,
      ),
    ).toThrow(MissingComponentError)
  })
})
