import { find, map } from "lodash/fp"

import { Component } from "../../models/component"
import { MissingComponentError } from "../../models/missingComponentError"
import { ShelfUnit } from "../../models/shelfUnit"

type TopCoverCalculationContext = {
  shelfUnitsByWidth: ShelfUnit[]
}

export function calculateTopCoverDemand(
  { shelfUnitsByWidth }: TopCoverCalculationContext,
  inventory: Component[],
) {
  return map(({ numberOfShelfUnits, width }) => {
    const availableTopCover = find({ category: "topCover", width }, inventory)

    if (!availableTopCover) {
      throw new MissingComponentError(
        `No top cover found for width ${width}cm`,
        { category: "topCover", width },
      )
    }

    return {
      id: availableTopCover.id,
      quantity: numberOfShelfUnits,
    }
  }, shelfUnitsByWidth)
}
