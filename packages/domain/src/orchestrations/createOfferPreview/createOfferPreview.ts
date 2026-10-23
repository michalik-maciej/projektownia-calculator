import { isExcludedFromOffer } from "@/schemas/LayoutWall.schema"
import type { OfferInput, OfferOutput } from "@/schemas/Offer.schema"

import { calculateBomPrice } from "../../calculations/calculateBomPrice/calculateBomPrice"
import { Component } from "../../models/component"
import { breakdownDemandByCategory } from "../../transformations/breakdownDemandByCategory/breakdownDemandByCategory"
import { mapLayoutsToOfferOutput } from "../../transformations/mapLayoutsToOfferOutput/mapLayoutsToOfferOutput"
import { summarizeRunningMetres } from "../../transformations/summarizeRunningMetres/summarizeRunningMetres"
import { calculateOfferDemand } from "../calculateOfferDemand/calculateOfferDemand"
import { calculatePriceStripDemand } from "../calculatePriceStripDemand/calculatePriceStripDemand"
import { calculateShelfStopDemand } from "../calculateShelfStopDemand/calculateShelfStopDemand"

export function createOfferPreview(
  {
    discountPercentage,
    hasPriceStrips,
    layouts,
    shelfStopPercentage,
    title,
  }: OfferInput,
  inventory: Component[],
): OfferOutput {
  const offeredLayouts = layouts.filter(
    (layout) => !isExcludedFromOffer(layout),
  )
  const priceStripDemand = hasPriceStrips
    ? calculatePriceStripDemand(offeredLayouts, inventory)
    : []
  const shelfStopDemand = calculateShelfStopDemand(
    offeredLayouts,
    shelfStopPercentage,
    inventory,
  )
  const bom = [
    ...calculateOfferDemand(offeredLayouts, inventory),
    ...priceStripDemand,
    ...shelfStopDemand,
  ]

  return {
    breakdown: breakdownDemandByCategory(bom, inventory),
    layouts: mapLayoutsToOfferOutput(layouts, inventory),
    priceStrips: summarizeRunningMetres(priceStripDemand, inventory),
    shelfStops: summarizeRunningMetres(shelfStopDemand, inventory),
    pricing: {
      ...calculateBomPrice({ bom, discountPercentage }, inventory),
      discountPercentage,
    },
    title,
  }
}
