import { find, sumBy } from "lodash/fp"

import { calculateBomPrice } from "../../calculations/calculateBomPrice/calculateBomPrice"
import { Component, ComponentDemand } from "../../models/component"

const CENTIMETRES_PER_METRE = 100

export function summarizeRunningMetres(
  demand: ComponentDemand,
  inventory: Component[],
) {
  if (demand.length === 0) {
    return null
  }

  const lengthInCentimetres = sumBy(
    ({ id, quantity }) => quantity * (find({ id }, inventory)?.width ?? 0),
    demand,
  )

  return {
    basePrice: calculateBomPrice({ bom: demand }, inventory).basePrice,
    quantity: lengthInCentimetres / CENTIMETRES_PER_METRE,
  }
}
