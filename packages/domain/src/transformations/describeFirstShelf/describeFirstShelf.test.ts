import { describe, expect, it } from "vitest"

import { describeFirstShelf } from "./describeFirstShelf"

describe("describeFirstShelf", () => {
  it("describes the first shelf of the first unit that has one", () => {
    expect(
      describeFirstShelf([
        { numberOfShelfUnits: 1, shelves: [], width: 80 },
        {
          numberOfShelfUnits: 2,
          shelves: [
            { depth: 37, numberOfShelves: 5 },
            { depth: 47, numberOfShelves: 1 },
          ],
          width: 100,
        },
      ]),
    ).toEqual("5x37")
  })

  it("returns nothing for units without shelves", () => {
    expect(
      describeFirstShelf([{ numberOfShelfUnits: 1, shelves: [], width: 80 }]),
    ).toBeUndefined()
  })
})
