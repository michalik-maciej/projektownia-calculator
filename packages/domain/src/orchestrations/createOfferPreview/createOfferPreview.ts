import type { OfferInput, OfferOutput } from "@/schemas/Offer.schema"

import { calculateBomPrice } from "../../calculations/calculateBomPrice/calculateBomPrice"
import { calculatePriceStripDemand } from "../../calculations/calculatePriceStripDemand/calculatePriceStripDemand"
import { Component } from "../../models/component"
import { breakdownDemandByCategory } from "../../transformations/breakdownDemandByCategory/breakdownDemandByCategory"
import { mapLayoutsToOfferOutput } from "../../transformations/mapLayoutsToOfferOutput/mapLayoutsToOfferOutput"
import { summarizePriceStrips } from "../../transformations/summarizePriceStrips/summarizePriceStrips"
import { calculateOfferDemand } from "../calculateOfferDemand/calculateOfferDemand"

export function createOfferPreview(
  { discountPercentage, hasPriceStrips, layouts, title }: OfferInput,
  inventory: Component[],
): OfferOutput {
  const priceStripDemand = hasPriceStrips
    ? calculatePriceStripDemand(layouts, inventory)
    : []
  const bom = [...calculateOfferDemand(layouts, inventory), ...priceStripDemand]

  return {
    breakdown: breakdownDemandByCategory(bom, inventory),
    layouts: mapLayoutsToOfferOutput(layouts, inventory),
    priceStrips: summarizePriceStrips(priceStripDemand, inventory),
    pricing: {
      ...calculateBomPrice({ bom, discountPercentage }, inventory),
      discountPercentage,
    },
    title,
  }
}
