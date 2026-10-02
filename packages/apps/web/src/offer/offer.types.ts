import { FieldPathByValue } from "react-hook-form"

import { OfferInput } from "@/schemas/Offer.schema"

export type NumberPath = FieldPathByValue<OfferInput, number | undefined>
export type EndCapPart = "leftEndCap" | "rightEndCap"
export type LayoutPart = EndCapPart | "middle" | "secondSide"
type EndCapPath = `layouts.${number}.${EndCapPart}`
type GondolaSidePath = `layouts.${number}.sides.${0 | 1}`
export type RunOptionsPath = `layouts.${number}` | EndCapPath | GondolaSidePath

export type ComponentQuantitiesPath =
  | `layouts.${number}.extras`
  | `layouts.${number}.items`

export type UnitsPath = RunOptionsPath
