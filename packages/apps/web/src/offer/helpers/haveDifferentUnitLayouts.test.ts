import { describe, expect, it } from "vitest"

import { GondolaSide } from "@/schemas/LayoutGondola.schema"

import { haveDifferentUnitLayouts } from "./haveDifferentUnitLayouts"

const createSide = (
  shelfUnits: GondolaSide["shelfUnits"],
  depth = 47,
): GondolaSide => ({ depth, shelfUnits })

describe("haveDifferentUnitLayouts", () => {
  it("treats the same widths in the same order as one layout", () => {
    expect(
      haveDifferentUnitLayouts([
        createSide([{ numberOfShelfUnits: 2, shelves: [], width: 80 }]),
        createSide(
          [
            { numberOfShelfUnits: 1, shelves: [], width: 80 },
            {
              numberOfShelfUnits: 1,
              shelves: [{ depth: 37, numberOfShelves: 4 }],
              width: 80,
            },
          ],
          37,
        ),
      ]),
    ).toBe(false)
  })

  it("spots a shortened unit facing a full one", () => {
    expect(
      haveDifferentUnitLayouts([
        createSide([{ numberOfShelfUnits: 2, shelves: [], width: 125 }]),
        createSide([
          { numberOfShelfUnits: 1, shelves: [], width: 125 },
          { numberOfShelfUnits: 1, shelves: [], width: 80 },
        ]),
      ]),
    ).toBe(true)
  })

  it("spots sides with a different number of units", () => {
    expect(
      haveDifferentUnitLayouts([
        createSide([{ numberOfShelfUnits: 3, shelves: [], width: 80 }]),
        createSide([{ numberOfShelfUnits: 2, shelves: [], width: 80 }]),
      ]),
    ).toBe(true)
  })
})
