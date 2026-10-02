import { find, lowerFirst } from "lodash/fp"

import { Component, ComponentDemand } from "../../models/component"

export function describeComponentQuantity(
  { id, quantity }: ComponentDemand[number],
  inventory: Component[],
) {
  const label = find({ id }, inventory)?.label ?? id

  return `${lowerFirst(label)} x${quantity}`
}
