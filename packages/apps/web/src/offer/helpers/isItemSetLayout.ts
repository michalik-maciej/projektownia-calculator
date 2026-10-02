import { LayoutItemSet } from "@/schemas/LayoutItemSet.schema"
import { OfferInput } from "@/schemas/Offer.schema"

type Layout = OfferInput["layouts"][number]

export const isItemSetLayout = (layout: Layout): layout is LayoutItemSet =>
  "items" in layout
