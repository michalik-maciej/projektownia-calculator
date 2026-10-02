import { describe, expect, it } from "vitest"

import { calculateOfferDemand } from "./calculateOfferDemand"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("calculateOfferDemand", () => {
  it("returns complete demand", () => {
    const result = calculateOfferDemand(
      [
        {
          height: 130,
          numberOfLayouts: 1,
          gondolaUnits: [
            {
              depth: 37,
              shelfUnits: [
                {
                  numberOfShelfUnits: 1,
                  shelves: [],
                  width: 80,
                },
              ],
            },
          ],
        },
        {
          depth: 47,
          height: 210,
          numberOfLayouts: 1,
          shelfUnits: [
            {
              width: 100,
              numberOfShelfUnits: 1,
              shelves: [],
            },
          ],
        },
      ],
      componentCatalogMock,
    )

    const expectedResult = [
      { id: "back-40-80", quantity: 6 },
      { id: "shelf-80-37", quantity: 2 },
      { id: "leg-130-8-3", quantity: 2 },
      { id: "foot-37", quantity: 4 },
      { id: "back-40-100", quantity: 5 },
      { id: "shelf-100-47", quantity: 1 },
      { id: "leg-210-8-3", quantity: 2 },
      { id: "foot-47", quantity: 2 },
    ]

    expect(result).toHaveLength(8)
    expect(result).toEqual(expectedResult)
  })

  it("adds the items of an item set to the demand of the other layouts", () => {
    const result = calculateOfferDemand(
      [
        {
          depth: 47,
          height: 210,
          numberOfLayouts: 1,
          shelfUnits: [
            {
              width: 100,
              numberOfShelfUnits: 1,
              shelves: [],
            },
          ],
        },
        {
          items: [
            { id: "foot-47", quantity: 3 },
            { id: "misc-inne-3-240-3", quantity: 2 },
          ],
        },
      ],
      componentCatalogMock,
    )

    expect(result).toEqual([
      { id: "back-40-100", quantity: 5 },
      { id: "shelf-100-47", quantity: 1 },
      { id: "leg-210-8-3", quantity: 2 },
      { id: "foot-47", quantity: 5 },
      { id: "misc-inne-3-240-3", quantity: 2 },
    ])
  })
})
