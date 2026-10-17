import { OfferInput } from "@/schemas/Offer.schema"

import { isGondolaLayout } from "./isGondolaLayout"
import { isItemSetLayout } from "./isItemSetLayout"

export function getLayoutName(layout: OfferInput["layouts"][number]) {
  if (isGondolaLayout(layout)) return "Gondola"
  if (isItemSetLayout(layout)) return "Zestaw elementów"
  return "Ciąg przyścienny"
}
