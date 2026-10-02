import { DEFAULT_BACK_VARIANT, LayoutWall } from "@/schemas/LayoutWall.schema"
import { DEFAULT_SHELF_COUNT_BY_HEIGHT } from "@/schemas/ShelfDefaults"

import { InventoryDimensions } from "../hooks/useInventoryDimensions"

/**
 * Builds a starting wall run from whatever the inventory offers: the smallest
 * height, base depth and unit width, and a shelf count taken from the height.
 *
 * @returns `null` when the inventory cannot furnish a run at all, which is the
 * signal to keep the "add run" action disabled instead of creating a layout
 * with zeroed dimensions.
 */
export function createDefaultWallLayout({
  layoutHeights,
  layoutDepths,
  shelfUnitWidths,
  shelfDepths,
}: InventoryDimensions): LayoutWall | null {
  const height = layoutHeights[0]
  const depth = layoutDepths[0]
  const width = shelfUnitWidths[0]

  if (height == null || depth == null || width == null) return null

  const shelfDepth = shelfDepths.includes(depth) ? depth : shelfDepths[0]

  if (shelfDepth == null) return null

  return {
    backVariant: DEFAULT_BACK_VARIANT,
    depth,
    extras: [],
    hasBaseCover: true,
    height,
    numberOfLayouts: 1,
    shelfUnits: [
      {
        numberOfShelfUnits: 1,
        shelves: [
          {
            depth: shelfDepth,
            numberOfShelves: DEFAULT_SHELF_COUNT_BY_HEIGHT[height] ?? 1,
          },
        ],
        width,
      },
    ],
  }
}
