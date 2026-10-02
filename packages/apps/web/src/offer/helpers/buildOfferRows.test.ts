import { describe, expect, it } from "vitest"

import { buildOfferRows } from "./buildOfferRows"

describe("buildOfferRows", () => {
  it("gives every item of a set its own row, after the runs before it", () => {
    const rows = buildOfferRows(
      ["wall", "set"],
      [
        { basePrice: 500, breakdown: {}, description: "ciąg" },
        {
          basePrice: 388.78,
          breakdown: {},
          description: "zestaw elementów: stopa 37 x2, inne 3/240/3 x1",
          lines: [
            { basePrice: 88.78, description: "stopa 37 x2" },
            { basePrice: 300, description: "inne 3/240/3 x1" },
          ],
        },
      ],
    )

    expect(rows).toEqual([
      { basePrice: 500, description: "ciąg", key: "wall" },
      { basePrice: 88.78, description: "stopa 37 x2", key: "set-0" },
      { basePrice: 300, description: "inne 3/240/3 x1", key: "set-1" },
    ])
  })

  it("keeps one row per layout that has no price yet", () => {
    expect(buildOfferRows(["wall"], undefined)).toEqual([
      { basePrice: null, description: null, key: "wall" },
    ])
  })
})
