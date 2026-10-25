import { describe, expect, it } from "vitest"

import { limitBackShelvesToDepth } from "./createDefaultImpulseLayout"

describe("limitBackShelvesToDepth", () => {
  it("shortens back shelves deeper than the new back base", () => {
    const [bay] = limitBackShelvesToDepth(
      [
        {
          backShelves: [
            { depth: 47, numberOfShelves: 1 },
            { depth: 30, numberOfShelves: 2 },
          ],
          frontShelves: 5,
          height: 130,
          width: 100,
        },
      ],
      37,
    )

    expect(bay?.backShelves).toEqual([
      { depth: 37, numberOfShelves: 1 },
      { depth: 30, numberOfShelves: 2 },
    ])
  })
})
