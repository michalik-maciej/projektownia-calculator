import * as v from "valibot"
import { describe, expect, it } from "vitest"

import { OfferInputSchema } from "./Offer.schema"

describe("OfferInputSchema", () => {
  it("keeps whether a run is in the offer and its number on the drawing", () => {
    const side = { depth: 37, shelfUnits: [] }
    const excludedWall = {
      depth: 37,
      height: 210,
      numberOfLayouts: 1,
      drawingRunNumber: 5,
      isExcludedFromOffer: true,
      shelfUnits: [],
    }
    const excludedGondola = {
      height: 170,
      numberOfLayouts: 1,
      drawingRunNumber: 6,
      isExcludedFromOffer: true,
      sides: [side, side],
    }
    const excludedItemSet = { isExcludedFromOffer: true, items: [] }

    const { layouts } = v.parse(OfferInputSchema, {
      discountPercentage: 0,
      layouts: [excludedWall, excludedGondola, excludedItemSet],
      title: "Import",
    })

    expect(layouts).toEqual([excludedWall, excludedGondola, excludedItemSet])
  })
})
