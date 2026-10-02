import { GondolaEndCap } from "@/schemas/LayoutGondola.schema"
import { DEFAULT_BACK_VARIANT } from "@/schemas/LayoutWall.schema"

import { createDefaultWallLayout } from "./createDefaultWallLayout"
import { InventoryDimensions } from "../hooks/useInventoryDimensions"

export function createDefaultEndCap(
  dimensions: InventoryDimensions,
): GondolaEndCap | null {
  const wallLayout = createDefaultWallLayout(dimensions)

  if (!wallLayout) return null

  return {
    backVariant: DEFAULT_BACK_VARIANT,
    depth: wallLayout.depth,
    hasBaseCover: true,
    shelfUnits: wallLayout.shelfUnits,
  }
}
