import { describe, expect, it } from "vitest"

import { calculateTopCoverDemand } from "./calculateTopCoverDemand"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("calculateTopCoverDemand", () => {
  it("orders one cover per shelf unit, matched on width", () => {
    const result = calculateTopCoverDemand(
      {
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

  it("throws if top cover not found", () => {
    expect(() =>
      calculateTopCoverDemand(
        {
          shelfUnitsByWidth: [
            {
              width: 16,
              numberOfShelfUnits: 1,
            },
          ],
        },
        componentCatalogMock,
      ),
    ).toThrow()
  })
})
