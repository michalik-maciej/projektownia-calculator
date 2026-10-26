import { find, map } from "lodash/fp"

import { Component } from "../../models/component"
import { MissingComponentError } from "../../models/missingComponentError"
import { ShelfUnit } from "../../models/shelfUnit"

type BaseShelfCalculationContext = {
  depth: number
  shelfUnitsByWidth: ShelfUnit[]
}

export function calculateBaseShelfDemand(
  { depth, shelfUnitsByWidth }: BaseShelfCalculationContext,
  inventory: Component[],
) {
  return map(({ numberOfShelfUnits, width }) => {
    const availableShelf = find({ category: "shelf", depth, width }, inventory)

    if (!availableShelf) {
      throw new MissingComponentError(
        `No base shelf found for width ${width}cm and depth ${depth}cm`,
        { category: "shelf", depth, width },
      )
    }

    return {
      id: availableShelf.id,
      quantity: numberOfShelfUnits,
    }
  }, shelfUnitsByWidth)
}
