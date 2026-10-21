import { find, sumBy } from "lodash/fp"

import { calculateBomPrice } from "../../calculations/calculateBomPrice/calculateBomPrice"
import { Component, ComponentDemand } from "../../models/component"

const CENTIMETRES_PER_METRE = 100

export function summarizePriceStrips(
  priceStripDemand: ComponentDemand,
  inventory: Component[],
) {
  if (priceStripDemand.length === 0) {
    return null
  }

  const lengthInCentimetres = sumBy(
    ({ id, quantity }) => quantity * (find({ id }, inventory)?.width ?? 0),
    priceStripDemand,
  )

  return {
    basePrice: calculateBomPrice({ bom: priceStripDemand }, inventory)
      .basePrice,
    quantity: lengthInCentimetres / CENTIMETRES_PER_METRE,
  }
}
