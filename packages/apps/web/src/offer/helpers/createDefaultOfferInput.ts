import { OfferInput } from "@/schemas/Offer.schema"

import { createDefaultOfferTitle } from "./createDefaultOfferTitle"

const DEFAULT_DISCOUNT_PERCENTAGE = 44
const DEFAULT_SHELF_STOP_PERCENTAGE = 30

export function createDefaultOfferInput(): OfferInput {
  return {
    discountPercentage: DEFAULT_DISCOUNT_PERCENTAGE,
    hasPriceStrips: true,
    layouts: [],
    shelfStopPercentage: DEFAULT_SHELF_STOP_PERCENTAGE,
    title: createDefaultOfferTitle(),
  }
}
