import * as v from "valibot"

import {
  BACK_VARIANTS,
  ExtrasValue,
  OfferInclusionEntries,
} from "./LayoutWall.schema"

export const IMPULSE_LOW_HEIGHT = 90
export const IMPULSE_HIGH_HEIGHT = 130
export const IMPULSE_FRONT_DEPTH = 30
export const IMPULSE_BACK_DEPTHS = [47, 37] as const

const BASE_COVER_VARIANTS = [0, 1, 2] as const

const ImpulseBayValue = v.object({
  backShelves: v.array(
    v.object({
      depth: v.number(),
      numberOfShelves: v.pipe(v.number(), v.minValue(0)),
    }),
  ),
  frontShelves: v.pipe(v.number(), v.minValue(0)),
  height: v.picklist([IMPULSE_LOW_HEIGHT, IMPULSE_HIGH_HEIGHT]),
  width: v.number(),
})

export type ImpulseBay = v.InferOutput<typeof ImpulseBayValue>

export const LayoutImpulseValue = v.object({
  backDepth: v.picklist(IMPULSE_BACK_DEPTHS),
  backVariant: v.picklist(BACK_VARIANTS),
  baseCoverVariant: v.picklist(BASE_COVER_VARIANTS),
  bays: v.array(ImpulseBayValue),
  numberOfLayouts: v.pipe(v.number(), v.minValue(0)),
  extras: ExtrasValue,
  ...OfferInclusionEntries,
})

export type LayoutImpulse = v.InferOutput<typeof LayoutImpulseValue>

export const isLayoutImpulse = (layout: unknown): layout is LayoutImpulse =>
  v.safeParse(LayoutImpulseValue, layout).success
