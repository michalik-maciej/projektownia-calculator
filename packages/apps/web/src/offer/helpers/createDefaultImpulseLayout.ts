import {
  IMPULSE_BACK_DEPTHS,
  IMPULSE_HIGH_HEIGHT,
  IMPULSE_LOW_HEIGHT,
  ImpulseBay,
  LayoutImpulse,
} from "@/schemas/LayoutImpulse.schema"

import { InventoryDimensions } from "../hooks/useInventoryDimensions"

const DEFAULT_SHELF_COUNTS: Record<
  ImpulseBay["height"],
  { back: number; front: number }
> = {
  [IMPULSE_LOW_HEIGHT]: { back: 0, front: 2 },
  [IMPULSE_HIGH_HEIGHT]: { back: 1, front: 5 },
}

export function createDefaultImpulseShelves(
  height: ImpulseBay["height"],
  backDepth: LayoutImpulse["backDepth"],
): Pick<ImpulseBay, "backShelves" | "frontShelves"> {
  const { back, front } = DEFAULT_SHELF_COUNTS[height]

  return {
    backShelves: back > 0 ? [{ depth: backDepth, numberOfShelves: back }] : [],
    frontShelves: front,
  }
}

export function createDefaultImpulseLayout({
  shelfUnitWidths,
}: InventoryDimensions): LayoutImpulse | null {
  const width = shelfUnitWidths[0]

  if (width == null) return null

  const [backDepth] = IMPULSE_BACK_DEPTHS

  return {
    backDepth,
    backVariant: 2,
    baseCoverVariant: 1,
    bays: [
      {
        ...createDefaultImpulseShelves(IMPULSE_LOW_HEIGHT, backDepth),
        height: IMPULSE_LOW_HEIGHT,
        width,
      },
    ],
    extras: [],
    numberOfLayouts: 1,
  }
}

export function limitBackShelvesToDepth(
  bays: ImpulseBay[],
  backDepth: LayoutImpulse["backDepth"],
): ImpulseBay[] {
  return bays.map((bay) => ({
    ...bay,
    backShelves: bay.backShelves.map((shelf) => ({
      ...shelf,
      depth: Math.min(shelf.depth, backDepth),
    })),
  }))
}
