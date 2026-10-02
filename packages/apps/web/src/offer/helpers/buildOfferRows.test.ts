import { describe, expect, it } from "vitest"

import { buildOfferRows } from "./buildOfferRows"

const wallLayout = {
  depth: 47,
  height: 210,
  numberOfLayouts: 3,
  shelfUnits: [],
}

describe("buildOfferRows", () => {
  it("gives every item of a set its own row, after the runs before it", () => {
    const rows = buildOfferRows({
      keys: ["wall", "set"],
      layoutOutputs: [
        {
          basePrice: 500,
          breakdown: {},
          description: "ciąg regałów przyściennych",
        },
        {
          basePrice: 388.78,
          breakdown: {},
          description: "zestaw elementów: stopa 37, inne 3/240/3",
          lines: [
            { basePrice: 88.78, description: "stopa 37", quantity: 2 },
            { basePrice: 300, description: "inne 3/240/3", quantity: 1 },
          ],
        },
      ],
      layouts: [
        wallLayout,
        {
          items: [
            { id: "foot-37", quantity: 2 },
            { id: "misc-inne-3-240-3", quantity: 1 },
          ],
        },
      ],
    })

    expect(rows).toEqual([
      {
        basePrice: 500,
        description: "ciąg regałów przyściennych",
        key: "wall",
        quantity: 3,
      },
      { basePrice: 88.78, description: "stopa 37", key: "set-0", quantity: 2 },
      {
        basePrice: 300,
        description: "inne 3/240/3",
        key: "set-1",
        quantity: 1,
      },
    ])
  })

  it("keeps one row per layout that has no price yet", () => {
    expect(
      buildOfferRows({
        keys: ["wall"],
        layoutOutputs: undefined,
        layouts: [wallLayout],
      }),
    ).toEqual([
      { basePrice: null, description: null, key: "wall", quantity: 3 },
    ])
  })
})
