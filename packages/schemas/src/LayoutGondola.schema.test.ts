import * as v from "valibot"
import { describe, expect, it } from "vitest"

import { LayoutGondolaValue } from "./LayoutGondola.schema"

describe("LayoutGondolaValue", () => {
  it("reads a gondola saved as one symmetric entry as two equal sides", () => {
    const result = v.parse(LayoutGondolaValue, {
      backVariant: 2,
      gondolaUnits: [
        {
          depth: 47,
          shelfUnits: [{ numberOfShelfUnits: 2, shelves: [], width: 80 }],
        },
      ],
      hasBaseCover: true,
      height: 130,
      numberOfLayouts: 1,
    })

    const side = {
      backVariant: 2,
      depth: 47,
      hasBaseCover: true,
      shelfUnits: [{ numberOfShelfUnits: 2, shelves: [], width: 80 }],
    }

    expect(result).toEqual({
      height: 130,
      numberOfLayouts: 1,
      sides: [side, side],
    })
    expect(result.sides[0]).not.toBe(result.sides[1])
  })
})
