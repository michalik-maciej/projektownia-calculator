import { find, reduce } from "lodash/fp"

import { Component, ComponentDemand } from "../../models/component"
import { MissingComponentError } from "../../models/missingComponentError"

type BomPriceCalculationContext = {
  bom: ComponentDemand
  discountPercentage?: number
}

export function calculateBomPrice(
  { bom, discountPercentage = 0 }: BomPriceCalculationContext,
  inventory: Component[],
) {
  const basePrice = reduce(
    (total, { id, quantity }) => {
      const component = find({ id }, inventory)
      if (!component) {
        throw new MissingComponentError(
          `Component with id ${id} not found in inventory`,
          { id },
        )
      }

      return total + component.price * quantity
    },
    0,
    bom,
  )
  const discountPrice = basePrice * (1 - discountPercentage / 100)

  return {
    basePrice: Number(basePrice.toFixed(2)),
    discountPrice: Number(discountPrice.toFixed(2)),
    discountPercentage,
  }
}
