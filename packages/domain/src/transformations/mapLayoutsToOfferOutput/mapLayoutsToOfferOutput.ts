import { isLayoutGondola } from "@/schemas/LayoutGondola.schema"
import { isLayoutItemSet } from "@/schemas/LayoutItemSet.schema"
import { isLayoutWall } from "@/schemas/LayoutWall.schema"
import { OfferInput, OfferOutput } from "@/schemas/Offer.schema"

import { calculateBomPrice } from "../../calculations/calculateBomPrice/calculateBomPrice"
import { Component, ComponentDemand } from "../../models/component"
import { calculateGondolaLayoutDemand } from "../../orchestrations/calculateGondolaLayoutDemand/calculateGondolaLayoutDemand"
import { calculateWallLayoutDemand } from "../../orchestrations/calculateWallLayoutDemand/calculateWallLayoutDemand"
import { breakdownDemandByCategory } from "../../transformations/breakdownDemandByCategory/breakdownDemandByCategory"
import { buildItemSetLines } from "../buildItemSetLines/buildItemSetLines"
import { buildLayoutDescription } from "../buildLayoutDescription/buildLayoutDescription"

export const mapLayoutsToOfferOutput = (
  layouts: OfferInput["layouts"],
  inventory: Component[],
): OfferOutput["layouts"] =>
  layouts.map((layout) => {
    let bom: ComponentDemand = []

    switch (true) {
      case isLayoutWall(layout):
        bom = calculateWallLayoutDemand(layout, inventory)
        break
      case isLayoutGondola(layout):
        bom = calculateGondolaLayoutDemand(layout, inventory)
        break
      case isLayoutItemSet(layout):
        bom = layout.items
    }
    const { basePrice } = calculateBomPrice({ bom }, inventory)
    const description = buildLayoutDescription(layout, inventory)
    const breakdown = breakdownDemandByCategory(bom, inventory)

    return {
      basePrice,
      description,
      breakdown,
      ...(isLayoutItemSet(layout) && {
        lines: buildItemSetLines(layout, inventory),
      }),
    }
  })
