import { LayoutGondola } from "@/schemas/LayoutGondola.schema"

import { createDefaultWallLayout } from "./createDefaultWallLayout"
import { InventoryDimensions } from "../hooks/useInventoryDimensions"

export function createDefaultGondolaLayout(
  dimensions: InventoryDimensions,
): LayoutGondola | null {
  const wallLayout = createDefaultWallLayout(dimensions)

  if (!wallLayout) return null

  return {
    extras: [],
    gondolaUnits: [
      {
        depth: wallLayout.depth,
        shelfUnits: wallLayout.shelfUnits,
      },
    ],
    hasBaseCover: true,
    height: wallLayout.height,
    numberOfLayouts: wallLayout.numberOfLayouts,
  }
}
