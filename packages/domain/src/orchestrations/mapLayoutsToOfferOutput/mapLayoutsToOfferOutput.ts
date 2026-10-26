import { isLayoutItemSet } from "@/schemas/LayoutItemSet.schema"
import { isExcludedFromOffer } from "@/schemas/LayoutWall.schema"
import { OfferInput, OfferOutput } from "@/schemas/Offer.schema"

import { calculateBomPrice } from "../../calculations/calculateBomPrice/calculateBomPrice"
import { Component } from "../../models/component"
import { breakdownDemandByCategory } from "../../transformations/breakdownDemandByCategory/breakdownDemandByCategory"
import { buildItemSetLines } from "../../transformations/buildItemSetLines/buildItemSetLines"
import { buildLayoutDescription } from "../../transformations/buildLayoutDescription/buildLayoutDescription"
import { calculateLayoutDemand } from "../calculateLayoutDemand/calculateLayoutDemand"

type LayoutOutputCalculationContext = {
  layouts: OfferInput["layouts"]
}

export const mapLayoutsToOfferOutput = (
  { layouts }: LayoutOutputCalculationContext,
  inventory: Component[],
): OfferOutput["layouts"] =>
  layouts.map((layout) => {
    const bom = isExcludedFromOffer(layout)
      ? []
      : calculateLayoutDemand(layout, inventory)
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
