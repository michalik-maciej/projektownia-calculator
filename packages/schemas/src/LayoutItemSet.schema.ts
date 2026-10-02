import * as v from "valibot"

export const LayoutItemSetValue = v.object({
  items: v.array(
    v.object({
      id: v.string(),
      quantity: v.pipe(v.number(), v.minValue(1)),
    }),
  ),
})

export type LayoutItemSet = v.InferOutput<typeof LayoutItemSetValue>

export const isLayoutItemSet = (layout: unknown): layout is LayoutItemSet =>
  v.safeParse(LayoutItemSetValue, layout).success
