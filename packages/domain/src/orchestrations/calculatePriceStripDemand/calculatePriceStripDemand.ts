import { OfferInput } from "@/schemas/Offer.schema"

import { Component, ComponentDemand } from "../../models/component"
import { countShelvesByWidth } from "../../transformations/countShelvesByWidth/countShelvesByWidth"
import { matchComponentsByWidth } from "../../transformations/matchComponentsByWidth/matchComponentsByWidth"

type PriceStripDemandCalculationContext = {
  layouts: OfferInput["layouts"]
}

export function calculatePriceStripDemand(
  { layouts }: PriceStripDemandCalculationContext,
  inventory: Component[],
): ComponentDemand {
  return matchComponentsByWidth(
    "priceStrip",
    countShelvesByWidth(layouts).map(({ numberOfShelves, width }) => ({
      quantity: numberOfShelves,
      width,
    })),
    inventory,
  )
}
