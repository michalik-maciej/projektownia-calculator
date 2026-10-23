import { LayoutImpulse } from "@/schemas/LayoutImpulse.schema"
import { OfferInput } from "@/schemas/Offer.schema"

type Layout = OfferInput["layouts"][number]

export const isImpulseLayout = (layout: Layout): layout is LayoutImpulse =>
  "bays" in layout
