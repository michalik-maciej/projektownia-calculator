import {
  COMPONENT_CATEGORIES,
  type ComponentCategory,
} from "@/schemas/inventory/Component.schema"

import type { InventoryItem } from "../inventory.api"

function uniqueNumbers(values: Array<number | null | undefined>) {
  return Array.from(new Set(values.filter((v): v is number => v != null))).sort(
    (a, b) => a - b,
  )
}

interface Params {
  dimension: "width" | "height" | "depth"
  inventoryItems: InventoryItem[]
}

export function getDimensionOptions({ dimension, inventoryItems }: Params) {
  const optionsByCategory: Record<ComponentCategory, number[]> = {
    back: [],
    baseCover: [],
    foot: [],
    leg: [],
    misc: [],
    priceStrip: [],
    shelf: [],
    support: [],
    topCover: [],
  }

  for (const category of COMPONENT_CATEGORIES) {
    const itemsForCategory = inventoryItems.filter(
      (item) => item.category === category,
    )

    optionsByCategory[category] = uniqueNumbers(
      itemsForCategory.map((c) => c[dimension]),
    )
  }

  return optionsByCategory
}
