import * as v from "valibot"

import { BACK_VARIANTS } from "./LayoutWall.schema"

const ShelfUnitValue = v.object({
  numberOfShelfUnits: v.pipe(v.number(), v.minValue(0)),
  shelves: v.array(
    v.object({
      depth: v.number(),
      numberOfShelves: v.pipe(v.number(), v.minValue(0)),
    }),
  ),
  width: v.number(),
})

export const GondolaSideValue = v.object({
  backVariant: v.optional(v.picklist(BACK_VARIANTS)),
  depth: v.number(),
  hasBaseCover: v.optional(v.boolean()),
  shelfUnits: v.array(ShelfUnitValue),
})

export type GondolaSide = v.InferOutput<typeof GondolaSideValue>
export type GondolaEndCap = GondolaSide

const ExtrasValue = v.optional(
  v.array(
    v.object({
      id: v.string(),
      quantity: v.number(),
    }),
  ),
)

const CurrentLayoutGondolaValue = v.object({
  height: v.number(),
  numberOfLayouts: v.pipe(v.number(), v.minValue(0)),
  sides: v.tuple([GondolaSideValue, GondolaSideValue]),
  leftEndCap: v.optional(GondolaSideValue),
  rightEndCap: v.optional(GondolaSideValue),
  extras: ExtrasValue,
})

export type LayoutGondola = v.InferOutput<typeof CurrentLayoutGondolaValue>

const LegacyLayoutGondolaValue = v.pipe(
  v.object({
    height: v.number(),
    numberOfLayouts: v.pipe(v.number(), v.minValue(0)),
    gondolaUnits: v.tuple([
      v.object({
        depth: v.number(),
        shelfUnits: v.array(ShelfUnitValue),
      }),
    ]),
    backVariant: v.optional(v.picklist(BACK_VARIANTS)),
    hasBaseCover: v.optional(v.boolean()),
    leftEndCap: v.optional(GondolaSideValue),
    rightEndCap: v.optional(GondolaSideValue),
    extras: ExtrasValue,
  }),
  v.transform(
    ({
      backVariant,
      gondolaUnits: [unit],
      hasBaseCover,
      ...layout
    }): LayoutGondola => {
      const side = { backVariant, hasBaseCover, ...unit }

      return { ...layout, sides: [side, structuredClone(side)] }
    },
  ),
)

export const LayoutGondolaValue = v.union([
  CurrentLayoutGondolaValue,
  LegacyLayoutGondolaValue,
])

export const isLayoutGondola = (layout: unknown): layout is LayoutGondola =>
  v.safeParse(CurrentLayoutGondolaValue, layout).success
