import { describe, expect, it } from "vitest"

import { calculateGondolaLayoutDemand } from "./calculateGondolaLayoutDemand"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("calculateGondolaLayoutDemand", () => {
  it("returns complete demand", () => {
    const side = {
      depth: 47,
      shelfUnits: [
        {
          numberOfShelfUnits: 2,
          shelves: [],
          width: 80,
        },
        {
          numberOfShelfUnits: 1,
          shelves: [],
          width: 100,
        },
      ],
    }

    const result = calculateGondolaLayoutDemand(
      {
        height: 130,
        numberOfLayouts: 1,
        sides: [side, side],
        extras: [{ id: "extra-37", quantity: 2 }],
      },
      componentCatalogMock,
    )

    const expectedResult = [
      { id: "back-40-80", quantity: 6 },
      { id: "back-40-100", quantity: 3 },
      { id: "shelf-80-47", quantity: 2 },
      { id: "shelf-100-47", quantity: 1 },
      { id: "foot-47", quantity: 4 },
      { id: "back-40-80", quantity: 6 },
      { id: "back-40-100", quantity: 3 },
      { id: "shelf-80-47", quantity: 2 },
      { id: "shelf-100-47", quantity: 1 },
      { id: "foot-47", quantity: 4 },
      { id: "leg-130-8-3", quantity: 4 },
      { id: "extra-37", quantity: 2 },
    ]

    expect(result).toEqual(expectedResult)
  })

  it("counts one upright column per run copy", () => {
    const side = {
      depth: 47,
      shelfUnits: [
        {
          numberOfShelfUnits: 2,
          shelves: [],
          width: 80,
        },
      ],
    }

    const result = calculateGondolaLayoutDemand(
      {
        height: 130,
        numberOfLayouts: 3,
        sides: [side, side],
      },
      componentCatalogMock,
    )

    const expectedResult = [
      { id: "back-40-80", quantity: 18 },
      { id: "shelf-80-47", quantity: 6 },
      { id: "foot-47", quantity: 9 },
      { id: "back-40-80", quantity: 18 },
      { id: "shelf-80-47", quantity: 6 },
      { id: "foot-47", quantity: 9 },
      { id: "leg-130-8-3", quantity: 9 },
    ]

    expect(result).toEqual(expectedResult)
  })

  it("configures each side on its own", () => {
    const result = calculateGondolaLayoutDemand(
      {
        height: 130,
        numberOfLayouts: 1,
        sides: [
          {
            backVariant: 2,
            depth: 47,
            hasBaseCover: true,
            shelfUnits: [
              {
                numberOfShelfUnits: 2,
                shelves: [],
                width: 80,
              },
            ],
          },
          {
            backVariant: 0,
            depth: 37,
            shelfUnits: [
              {
                numberOfShelfUnits: 2,
                shelves: [],
                width: 80,
              },
            ],
          },
        ],
      },
      componentCatalogMock,
    )

    const expectedResult = [
      { id: "back-40-80", quantity: 12 },
      { id: "base-cover-80", quantity: 2 },
      { id: "shelf-80-47", quantity: 2 },
      { id: "foot-47", quantity: 3 },
      { id: "shelf-80-37", quantity: 2 },
      { id: "foot-37", quantity: 3 },
      { id: "leg-130-8-3", quantity: 3 },
    ]

    expect(result).toEqual(expectedResult)
  })

  it("takes the upright column from the side with more shelf units", () => {
    const result = calculateGondolaLayoutDemand(
      {
        height: 130,
        numberOfLayouts: 1,
        sides: [
          {
            depth: 47,
            shelfUnits: [
              {
                numberOfShelfUnits: 1,
                shelves: [],
                width: 100,
              },
              {
                numberOfShelfUnits: 1,
                shelves: [],
                width: 80,
              },
            ],
          },
          {
            depth: 47,
            shelfUnits: [
              {
                numberOfShelfUnits: 3,
                shelves: [],
                width: 80,
              },
            ],
          },
        ],
      },
      componentCatalogMock,
    )

    const expectedResult = [
      { id: "back-40-100", quantity: 3 },
      { id: "back-40-80", quantity: 3 },
      { id: "shelf-100-47", quantity: 1 },
      { id: "shelf-80-47", quantity: 1 },
      { id: "foot-47", quantity: 3 },
      { id: "back-40-80", quantity: 9 },
      { id: "shelf-80-47", quantity: 3 },
      { id: "foot-47", quantity: 4 },
      { id: "leg-130-8-3", quantity: 4 },
    ]

    expect(result).toEqual(expectedResult)
  })

  it("leaves a leg needed by mismatched sides to the extras", () => {
    const result = calculateGondolaLayoutDemand(
      {
        height: 130,
        numberOfLayouts: 1,
        sides: [
          {
            depth: 47,
            shelfUnits: [
              {
                numberOfShelfUnits: 2,
                shelves: [],
                width: 125,
              },
            ],
          },
          {
            depth: 47,
            shelfUnits: [
              {
                numberOfShelfUnits: 1,
                shelves: [],
                width: 125,
              },
              {
                numberOfShelfUnits: 1,
                shelves: [],
                width: 80,
              },
            ],
          },
        ],
        extras: [{ id: "leg-130-8-3", quantity: 1 }],
      },
      componentCatalogMock,
    )

    const expectedResult = [
      { id: "back-40-125", quantity: 6 },
      { id: "shelf-125-47", quantity: 2 },
      { id: "foot-47", quantity: 3 },
      { id: "back-40-125", quantity: 3 },
      { id: "back-40-80", quantity: 3 },
      { id: "shelf-125-47", quantity: 1 },
      { id: "shelf-80-47", quantity: 1 },
      { id: "foot-47", quantity: 3 },
      { id: "leg-130-8-3", quantity: 3 },
      { id: "leg-130-8-3", quantity: 1 },
    ]

    expect(result).toEqual(expectedResult)
  })

  it("charges each end cap as a run of its own", () => {
    const side = {
      depth: 47,
      shelfUnits: [
        {
          numberOfShelfUnits: 2,
          shelves: [],
          width: 80,
        },
      ],
    }

    const result = calculateGondolaLayoutDemand(
      {
        height: 130,
        numberOfLayouts: 2,
        sides: [side, side],
        leftEndCap: {
          backVariant: 0,
          depth: 37,
          hasBaseCover: true,
          shelfUnits: [
            {
              numberOfShelfUnits: 1,
              shelves: [],
              width: 100,
            },
          ],
        },
        rightEndCap: {
          depth: 37,
          shelfUnits: [
            {
              numberOfShelfUnits: 1,
              shelves: [],
              width: 100,
            },
          ],
        },
      },
      componentCatalogMock,
    )

    const expectedResult = [
      { id: "back-40-80", quantity: 12 },
      { id: "shelf-80-47", quantity: 4 },
      { id: "foot-47", quantity: 6 },
      { id: "back-40-80", quantity: 12 },
      { id: "shelf-80-47", quantity: 4 },
      { id: "foot-47", quantity: 6 },
      { id: "leg-130-8-3", quantity: 6 },
      { id: "base-cover-100", quantity: 1 },
      { id: "shelf-100-37", quantity: 1 },
      { id: "foot-37", quantity: 2 },
      { id: "leg-130-8-3", quantity: 2 },
      { id: "back-40-100", quantity: 3 },
      { id: "shelf-100-37", quantity: 1 },
      { id: "foot-37", quantity: 2 },
      { id: "leg-130-8-3", quantity: 2 },
    ]

    expect(result).toEqual(expectedResult)
  })
})
