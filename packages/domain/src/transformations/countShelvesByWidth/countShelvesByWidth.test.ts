import { describe, expect, it } from "vitest"

import { countShelvesByWidth } from "./countShelvesByWidth"

describe("countShelvesByWidth", () => {
  it("counts each unit's base shelf and extra shelves by width, in every run including end caps", () => {
    const result = countShelvesByWidth([
      {
        depth: 47,
        height: 210,
        numberOfLayouts: 2,
        shelfUnits: [
          {
            numberOfShelfUnits: 3,
            shelves: [{ depth: 37, numberOfShelves: 2 }],
            width: 80,
          },
        ],
      },
      {
        height: 130,
        leftEndCap: {
          depth: 37,
          shelfUnits: [{ numberOfShelfUnits: 1, shelves: [], width: 80 }],
        },
        numberOfLayouts: 2,
        sides: [
          {
            depth: 47,
            shelfUnits: [{ numberOfShelfUnits: 1, shelves: [], width: 100 }],
          },
          {
            depth: 47,
            shelfUnits: [{ numberOfShelfUnits: 1, shelves: [], width: 100 }],
          },
        ],
      },
    ])

    expect(result).toEqual([
      { numberOfShelves: 20, width: 80 },
      { numberOfShelves: 4, width: 100 },
    ])
  })
})
