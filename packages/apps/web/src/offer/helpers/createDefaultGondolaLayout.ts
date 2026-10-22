import { LayoutGondola } from "@/schemas/LayoutGondola.schema"

import { createDefaultEndCap } from "./createDefaultEndCap"
import { createDefaultWallLayout } from "./createDefaultWallLayout"
import { InventoryDimensions } from "../hooks/useInventoryDimensions"

export function createDefaultGondolaLayout(
  dimensions: InventoryDimensions,
): LayoutGondola | null {
  const wallLayout = createDefaultWallLayout(dimensions)
  const endCap = createDefaultEndCap(dimensions)

  if (!wallLayout || !endCap) return null

  const side = {
    depth: wallLayout.depth,
    hasBaseCover: true,
    shelfUnits: wallLayout.shelfUnits,
  }

  return {
    extras: [],
    height: wallLayout.height,
    leftEndCap: endCap,
    numberOfLayouts: wallLayout.numberOfLayouts,
    rightEndCap: structuredClone(endCap),
    sides: [side, structuredClone(side)],
  }
}
