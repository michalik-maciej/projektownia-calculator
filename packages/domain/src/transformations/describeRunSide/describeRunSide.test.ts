import { describe, expect, it } from "vitest"

import { describeRunSide } from "./describeRunSide"

describe("describeRunSide", () => {
  it("lists the units, the base, the height and the first shelf", () => {
    expect(
      describeRunSide({
        depth: 47,
        height: 130,
        shelfUnits: [
          {
            numberOfShelfUnits: 2,
            shelves: [],
            width: 80,
          },
          {
            numberOfShelfUnits: 1,
            shelves: [{ depth: 37, numberOfShelves: 5 }],
            width: 100,
          },
        ],
      }),
    ).toEqual(["2x80", "1x100", "baza 47", "h-130", "półki 5x37"])
  })

  it("leaves the height out when none is given", () => {
    expect(
      describeRunSide({
        depth: 37,
        shelfUnits: [
          {
            numberOfShelfUnits: 1,
            shelves: [],
            width: 125,
          },
        ],
      }),
    ).toEqual(["1x125", "baza 37"])
  })
})
