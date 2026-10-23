import { OfferInput } from "@/schemas/Offer.schema"

import { Component, ComponentDemand } from "../../models/component"
import { countShelvesByWidth } from "../../transformations/countShelvesByWidth/countShelvesByWidth"
import { matchComponentsByWidth } from "../../transformations/matchComponentsByWidth/matchComponentsByWidth"

const FULL_PERCENTAGE = 100

export function calculateShelfStopDemand(
  layouts: OfferInput["layouts"],
  shelfStopPercentage: number,
  inventory: Component[],
): ComponentDemand {
  if (shelfStopPercentage === 0) {
    return []
  }

  return matchComponentsByWidth(
    "shelfStop",
    countShelvesByWidth(layouts).map(({ numberOfShelves, width }) => ({
      quantity: Math.ceil(
        (numberOfShelves * shelfStopPercentage) / FULL_PERCENTAGE,
      ),
      width,
    })),
    inventory,
  )
}
