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
          description: "H210 · B47",
        },
        {
          basePrice: 388.78,
          breakdown: {},
          description: "stopa 37, inne 3/240/3",
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
      priceStrips: null,
    })

    expect(rows).toEqual([
      {
        basePrice: 500,
        code: "P-01",
        description: "H210 · B47",
        key: "wall",
        name: "Ciąg przyścienny",
        quantity: 3,
      },
      {
        basePrice: 88.78,
        code: "Z-02",
        description: "stopa 37",
        key: "set-0",
        name: "Zestaw elementów",
        quantity: 2,
      },
      {
        basePrice: 300,
        code: "Z-02",
        description: "inne 3/240/3",
        key: "set-1",
        name: "Zestaw elementów",
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
        priceStrips: undefined,
      }),
    ).toEqual([
      {
        basePrice: null,
        code: "P-01",
        description: null,
        key: "wall",
        name: "Ciąg przyścienny",
        quantity: 3,
      },
    ])
  })

  it("leaves runs excluded from the offer out of the rows", () => {
    const rows = buildOfferRows({
      keys: ["excluded", "wall"],
      layoutOutputs: undefined,
      layouts: [{ ...wallLayout, isExcludedFromOffer: true }, wallLayout],
      priceStrips: null,
    })

    expect(rows).toEqual([
      {
        basePrice: null,
        code: "P-02",
        description: null,
        key: "wall",
        name: "Ciąg przyścienny",
        quantity: 3,
      },
    ])
  })

  it("lists all price strips as one row, in running metres, after the runs", () => {
    const rows = buildOfferRows({
      keys: ["wall"],
      layoutOutputs: undefined,
      layouts: [wallLayout],
      priceStrips: { basePrice: 40, quantity: 4.2 },
    })

    expect(rows.at(-1)).toEqual({
      basePrice: 40,
      code: null,
      description: "do wszystkich półek",
      key: "price-strips",
      name: "Listwy cenowe",
      quantity: 4.2,
      unit: "mb",
    })
  })
})
