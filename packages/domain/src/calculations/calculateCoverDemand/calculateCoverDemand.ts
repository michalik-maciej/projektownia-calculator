import { find, map } from "lodash/fp"

import { Component } from "../../models/component"
import { MissingComponentError } from "../../models/missingComponentError"
import { ShelfUnit } from "../../models/shelfUnit"

type CoverCalculationContext = {
  category: "baseCover" | "topCover"
  shelfUnitsByWidth: ShelfUnit[]
}

export function calculateCoverDemand(
  { category, shelfUnitsByWidth }: CoverCalculationContext,
  inventory: Component[],
) {
  return map(({ numberOfShelfUnits, width }) => {
    const availableCover = find({ category, width }, inventory)

    if (!availableCover) {
      throw new MissingComponentError(
        `No ${category} found for width ${width}cm`,
        { category, width },
      )
    }

    return {
      id: availableCover.id,
      quantity: numberOfShelfUnits,
    }
  }, shelfUnitsByWidth)
}
