import { describe, expect, it } from "vitest"

import { listImpulseSideShelfUnits } from "./listImpulseSideShelfUnits"

describe("listImpulseSideShelfUnits", () => {
  it("splits the bays into a front side of front-depth shelves and a back side of their back shelves", () => {
    const result = listImpulseSideShelfUnits([
      {
        backShelves: [{ depth: 37, numberOfShelves: 2 }],
        frontShelves: 1,
        height: 130,
        width: 80,
      },
      { backShelves: [], frontShelves: 0, height: 90, width: 100 },
    ])

    expect(result).toEqual([
      [
        {
          numberOfShelfUnits: 1,
          shelves: [{ depth: 30, numberOfShelves: 1 }],
          width: 80,
        },
        {
          numberOfShelfUnits: 1,
          shelves: [{ depth: 30, numberOfShelves: 0 }],
          width: 100,
        },
      ],
      [
        {
          numberOfShelfUnits: 1,
          shelves: [{ depth: 37, numberOfShelves: 2 }],
          width: 80,
        },
        { numberOfShelfUnits: 1, shelves: [], width: 100 },
      ],
    ])
  })
})
