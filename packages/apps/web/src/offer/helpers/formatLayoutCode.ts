import { OfferInput } from "@/schemas/Offer.schema"

import { isGondolaLayout } from "./isGondolaLayout"
import { isImpulseLayout } from "./isImpulseLayout"
import { isItemSetLayout } from "./isItemSetLayout"

const CODE_DIGITS = 2

function getCodeLetter(layout: OfferInput["layouts"][number]) {
  if (isGondolaLayout(layout)) return "G"
  if (isImpulseLayout(layout)) return "I"
  if (isItemSetLayout(layout)) return "Z"
  return "P"
}

export function formatLayoutCode(
  index: number,
  layout: OfferInput["layouts"][number],
) {
  return `${getCodeLetter(layout)}-${String(index + 1).padStart(CODE_DIGITS, "0")}`
}
