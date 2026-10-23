import * as v from "valibot"

export const COMPONENT_CATEGORIES = [
  "leg",
  "foot",
  "back",
  "shelf",
  "support",
  "baseCover",
  "topCover",
  "priceStrip",
  "shelfStop",
  "misc",
] as const

export const ComponentCategorySchema = v.picklist(COMPONENT_CATEGORIES)

export type ComponentCategory = v.InferOutput<typeof ComponentCategorySchema>

export const CATEGORY_REQUIREMENTS: Record<
  ComponentCategory,
  { required: ("width" | "height" | "depth")[] }
> = {
  back: { required: ["width", "height"] },
  baseCover: { required: ["width"] },
  foot: { required: ["depth"] },
  leg: { required: ["width", "height", "depth"] },
  misc: { required: [] },
  priceStrip: { required: ["width"] },
  shelf: { required: ["width", "depth"] },
  shelfStop: { required: ["width"] },
  support: { required: ["depth"] },
  topCover: { required: ["width"] },
}

export const ComponentBaseSchema = v.object({
  category: ComponentCategorySchema,
  depth: v.nullable(v.number()),
  height: v.nullable(v.number()),
  width: v.nullable(v.number()),
  label: v.string(),
  price: v.number(),
})
