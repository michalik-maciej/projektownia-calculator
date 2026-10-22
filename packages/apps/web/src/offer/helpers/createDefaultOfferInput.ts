import { OfferInput } from "@/schemas/Offer.schema"

import { createDefaultOfferTitle } from "./createDefaultOfferTitle"

const DEFAULT_DISCOUNT_PERCENTAGE = 44

export function createDefaultOfferInput(): OfferInput {
  return {
    discountPercentage: DEFAULT_DISCOUNT_PERCENTAGE,
    hasPriceStrips: true,
    layouts: [],
    title: createDefaultOfferTitle(),
  }
}
