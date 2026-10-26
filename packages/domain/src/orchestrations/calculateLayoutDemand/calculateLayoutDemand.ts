import { isLayoutGondola } from "@/schemas/LayoutGondola.schema"
import { isLayoutImpulse } from "@/schemas/LayoutImpulse.schema"
import { isLayoutItemSet } from "@/schemas/LayoutItemSet.schema"
import { isLayoutWall } from "@/schemas/LayoutWall.schema"
import { OfferInput } from "@/schemas/Offer.schema"

import { Component, ComponentDemand } from "../../models/component"
import { calculateGondolaLayoutDemand } from "../calculateGondolaLayoutDemand/calculateGondolaLayoutDemand"
import { calculateImpulseLayoutDemand } from "../calculateImpulseLayoutDemand/calculateImpulseLayoutDemand"
import { calculateWallLayoutDemand } from "../calculateWallLayoutDemand/calculateWallLayoutDemand"

export function calculateLayoutDemand(
  layout: OfferInput["layouts"][number],
  inventory: Component[],
): ComponentDemand {
  if (isLayoutWall(layout)) return calculateWallLayoutDemand(layout, inventory)
  if (isLayoutGondola(layout)) {
    return calculateGondolaLayoutDemand(layout, inventory)
  }
  if (isLayoutImpulse(layout)) {
    return calculateImpulseLayoutDemand(layout, inventory)
  }
  if (isLayoutItemSet(layout)) return layout.items
  return []
}
