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
  hasPriceStrips: v.optional(v.boolean(), true),
  layouts: v.array(
    v.union([LayoutGondolaValue, LayoutWallValue, LayoutItemSetValue]),
  ),
  metalColor: v.optional(v.picklist(METAL_COLORS)),
  priceStripColor: v.optional(v.picklist(PRICE_STRIP_COLORS)),
  title: v.string(),
})

export type OfferInput = v.InferOutput<typeof OfferInputSchema>

export const OfferUpdateSchema = v.object({
  ...OfferInputSchema.entries,
  expectedUpdatedAt: v.pipe(v.string(), v.isoTimestamp()),
})

export type OfferUpdate = v.InferOutput<typeof OfferUpdateSchema>

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
  authorEmail: v.string(),
  createdAt: v.string(),
  id: v.string(),
  lastUpdatedByEmail: v.nullable(v.string()),
  title: v.string(),
  updatedAt: v.string(),
})

export const SavedOfferSchema = v.object({
  createdAt: v.string(),
  id: v.string(),
  input: OfferInputSchema,
  missingComponent: v.optional(MissingComponentSchema),
  output: v.nullable(OfferOutputSchema),
  title: v.string(),
  updatedAt: v.string(),
})

export const OfferSharesSchema = v.object({
  userIds: v.pipe(
    v.array(v.pipe(v.string(), v.uuid())),
    v.check(
      (userIds) => new Set(userIds).size === userIds.length,
      "User ids must be unique",
    ),
  ),
})

export type OfferShares = v.InferOutput<typeof OfferSharesSchema>
export type OfferSummary = v.InferOutput<typeof OfferSummarySchema>
export type SavedOffer = v.InferOutput<typeof SavedOfferSchema>
