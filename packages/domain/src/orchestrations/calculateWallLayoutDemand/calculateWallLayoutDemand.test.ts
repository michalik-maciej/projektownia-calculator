import { describe, expect, it } from "vitest"

import { calculateWallLayoutDemand } from "./calculateWallLayoutDemand"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("calculateWallLayoutDemand", () => {
  it("returns complete demand", () => {
    const result = calculateWallLayoutDemand(
      {
        depth: 47,
        height: 130,
        numberOfLayouts: 2,
        shelfUnits: [
          {
            width: 100,
            numberOfShelfUnits: 1,
            shelves: [
              { depth: 37, numberOfShelves: 1 },
              { depth: 47, numberOfShelves: 1 },
            ],
          },
          {
            width: 80,
            numberOfShelfUnits: 4,
            shelves: [{ depth: 37, numberOfShelves: 5 }],
          },
        ],
        extras: [{ id: "extra-37", quantity: 4 }],
      },
      componentCatalogMock,
    )

    const expectedResult = [
      { id: "back-40-100", quantity: 6 },
      { id: "back-40-80", quantity: 24 },
      { id: "shelf-100-47", quantity: 2 },
      { id: "shelf-80-47", quantity: 8 },
      { id: "shelf-100-37", quantity: 2 },
      { id: "support-37", quantity: 84 },
      { id: "shelf-100-47", quantity: 2 },
      { id: "support-47", quantity: 4 },
      { id: "shelf-80-37", quantity: 40 },
      { id: "foot-47", quantity: 12 },
      { id: "leg-130-8-3", quantity: 12 },
      { id: "extra-37", quantity: 4 },
    ]

    expect(result).toHaveLength(12)
    expect(result).toEqual(expectedResult)
  })

  it("doubles the backs and adds base covers when the run asks for them", () => {
    const result = calculateWallLayoutDemand(
      {
        backVariant: 2,
        depth: 47,
        hasBaseCover: true,
        height: 130,
        numberOfLayouts: 2,
        shelfUnits: [
          {
            width: 100,
            numberOfShelfUnits: 1,
            shelves: [{ depth: 47, numberOfShelves: 1 }],
          },
          {
            width: 80,
            numberOfShelfUnits: 4,
            shelves: [{ depth: 37, numberOfShelves: 5 }],
          },
        ],
      },
      componentCatalogMock,
    )

    const expectedResult = [
      { id: "back-40-100", quantity: 12 },
      { id: "back-40-80", quantity: 48 },
      { id: "base-cover-100", quantity: 2 },
      { id: "base-cover-80", quantity: 8 },
      { id: "shelf-100-47", quantity: 2 },
      { id: "shelf-80-47", quantity: 8 },
      { id: "shelf-100-47", quantity: 2 },
      { id: "support-47", quantity: 4 },
      { id: "shelf-80-37", quantity: 40 },
      { id: "support-37", quantity: 80 },
      { id: "foot-47", quantity: 12 },
      { id: "leg-130-8-3", quantity: 12 },
    ]

    expect(result).toEqual(expectedResult)
  })

  it("orders no backs for a run without them", () => {
    const result = calculateWallLayoutDemand(
      {
        backVariant: 0,
        depth: 47,
        height: 130,
        numberOfLayouts: 1,
        shelfUnits: [
          {
            width: 100,
            numberOfShelfUnits: 1,
            shelves: [],
          },
        ],
      },
      componentCatalogMock,
    )

    expect(result).toEqual([
      { id: "shelf-100-47", quantity: 1 },
      { id: "foot-47", quantity: 2 },
      { id: "leg-130-8-3", quantity: 2 },
    ])
  })
})
