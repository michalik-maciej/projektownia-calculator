import { FieldPathByValue } from "react-hook-form"

import { OfferInput } from "@/schemas/Offer.schema"

export type NumberPath = FieldPathByValue<OfferInput, number | undefined>
export type LayoutPart = "leftEndCap" | "middle" | "rightEndCap"
type EndCapPath = `layouts.${number}.${Exclude<LayoutPart, "middle">}`
export type RunOptionsPath = `layouts.${number}` | EndCapPath

export type ComponentQuantitiesPath =
  | `layouts.${number}.extras`
  | `layouts.${number}.items`

export type UnitsPath =
  | RunOptionsPath
  | `layouts.${number}.gondolaUnits.${number}`
