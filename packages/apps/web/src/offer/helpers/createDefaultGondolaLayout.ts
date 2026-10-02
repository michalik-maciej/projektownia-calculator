import { LayoutGondola } from "@/schemas/LayoutGondola.schema"

import { createDefaultWallLayout } from "./createDefaultWallLayout"
import { InventoryDimensions } from "../hooks/useInventoryDimensions"

export function createDefaultGondolaLayout(
  dimensions: InventoryDimensions,
): LayoutGondola | null {
  const wallLayout = createDefaultWallLayout(dimensions)

  if (!wallLayout) return null

  const side = {
    depth: wallLayout.depth,
    hasBaseCover: true,
    shelfUnits: wallLayout.shelfUnits,
  }

  return {
    extras: [],
    height: wallLayout.height,
    numberOfLayouts: wallLayout.numberOfLayouts,
    sides: [side, structuredClone(side)],
  }
}
