import { LayoutItemSet } from "@/schemas/LayoutItemSet.schema"

import { calculateBomPrice } from "../../calculations/calculateBomPrice/calculateBomPrice"
import { Component } from "../../models/component"
import { describeComponent } from "../describeComponent/describeComponent"

export function buildItemSetLines(
  { items }: LayoutItemSet,
  inventory: Component[],
) {
  return items.map((item) => ({
    basePrice: calculateBomPrice({ bom: [item] }, inventory).basePrice,
    description: describeComponent(item.id, inventory),
    quantity: item.quantity,
  }))
}
