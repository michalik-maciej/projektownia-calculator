import { IMPULSE_FRONT_DEPTH, ImpulseBay } from "@/schemas/LayoutImpulse.schema"

import { ShelfUnit } from "../../models/shelfUnit"

export function listImpulseSideShelfUnits(bays: ImpulseBay[]): ShelfUnit[][] {
  return [
    bays.map(({ frontShelves, width }) => ({
      numberOfShelfUnits: 1,
      shelves: [{ depth: IMPULSE_FRONT_DEPTH, numberOfShelves: frontShelves }],
      width,
    })),
    bays.map(({ backShelves, width }) => ({
      numberOfShelfUnits: 1,
      shelves: backShelves,
      width,
    })),
  ]
}
