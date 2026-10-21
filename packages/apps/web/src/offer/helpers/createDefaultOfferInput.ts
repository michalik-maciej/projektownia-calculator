import { OfferInput } from "@/schemas/Offer.schema"

import { createDefaultOfferTitle } from "./createDefaultOfferTitle"

export function createDefaultOfferInput(): OfferInput {
  return {
    discountPercentage: 44,
    layouts: [],
    title: createDefaultOfferTitle(),
  }
}
