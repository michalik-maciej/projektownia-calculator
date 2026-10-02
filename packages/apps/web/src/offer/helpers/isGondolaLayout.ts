import { LayoutGondola } from "@/schemas/LayoutGondola.schema"
import { OfferInput } from "@/schemas/Offer.schema"

type Layout = OfferInput["layouts"][number]

export const isGondolaLayout = (layout: Layout): layout is LayoutGondola =>
  "sides" in layout
