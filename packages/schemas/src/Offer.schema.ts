import * as v from "valibot"

import { ComponentCategorySchema } from "./inventory/Component.schema"
import { LayoutGondolaValue } from "./LayoutGondola.schema"
import { LayoutItemSetValue } from "./LayoutItemSet.schema"
import { LayoutWallValue } from "./LayoutWall.schema"
import { MissingComponentSchema } from "./OfferError.schema"

export const PRICE_STRIP_COLORS = [
  "white",
  "black",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "transparent",
] as const

export const METAL_COLORS = ["graphite", "cream"] as const

export type PriceStripColor = (typeof PRICE_STRIP_COLORS)[number]
export type MetalColor = (typeof METAL_COLORS)[number]

export const OfferInputSchema = v.object({
  discountPercentage: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  hasPriceStrips: v.optional(v.boolean()),
  layouts: v.array(
    v.union([LayoutGondolaValue, LayoutWallValue, LayoutItemSetValue]),
  ),
  metalColor: v.optional(v.picklist(METAL_COLORS)),
  priceStripColor: v.optional(v.picklist(PRICE_STRIP_COLORS)),
  title: v.string(),
})

export type OfferInput = v.InferOutput<typeof OfferInputSchema>

const BreakdownSchema = v.record(
  ComponentCategorySchema,
  v.array(
    v.object({
      id: v.string(),
      label: v.string(),
      quantity: v.number(),
    }),
  ),
)

export const OfferOutputSchema = v.object({
  breakdown: BreakdownSchema,
  layouts: v.array(
    v.object({
      breakdown: BreakdownSchema,
      description: v.string(),
      basePrice: v.pipe(v.number(), v.minValue(0)),
      lines: v.optional(
        v.array(
          v.object({
            basePrice: v.pipe(v.number(), v.minValue(0)),
            description: v.string(),
            quantity: v.number(),
          }),
        ),
      ),
    }),
  ),
  priceStrips: v.nullable(
    v.object({
      basePrice: v.pipe(v.number(), v.minValue(0)),
      quantity: v.number(),
    }),
  ),
  pricing: v.object({
    basePrice: v.pipe(v.number(), v.minValue(0)),
    discountPrice: v.pipe(v.number(), v.minValue(0)),
    discountPercentage: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  }),
  title: v.string(),
})

export type OfferOutput = v.InferOutput<typeof OfferOutputSchema>

export const OfferSummarySchema = v.object({
  createdAt: v.string(),
  id: v.string(),
  title: v.string(),
})

export const SavedOfferSchema = v.object({
  createdAt: v.string(),
  id: v.string(),
  input: OfferInputSchema,
  missingComponent: v.optional(MissingComponentSchema),
  output: v.nullable(OfferOutputSchema),
  title: v.string(),
})

export type OfferSummary = v.InferOutput<typeof OfferSummarySchema>
export type SavedOffer = v.InferOutput<typeof SavedOfferSchema>
