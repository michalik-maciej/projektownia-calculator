import { compact, sumBy } from "lodash/fp"

import { isLayoutGondola } from "@/schemas/LayoutGondola.schema"
import { isLayoutImpulse } from "@/schemas/LayoutImpulse.schema"
import { isLayoutWall } from "@/schemas/LayoutWall.schema"
import { OfferInput } from "@/schemas/Offer.schema"

import { END_CAP_RUN_COUNT } from "../../models/endCap"
import { ShelfUnit } from "../../models/shelfUnit"
import { listImpulseSideShelfUnits } from "../listImpulseSideShelfUnits/listImpulseSideShelfUnits"

const BASE_SHELVES_PER_UNIT = 1

type ShelfRun = {
  numberOfRuns: number
  shelfUnits: ShelfUnit[]
}

function listShelfRuns(layout: OfferInput["layouts"][number]): ShelfRun[] {
  if (isLayoutWall(layout)) {
    return [
      { numberOfRuns: layout.numberOfLayouts, shelfUnits: layout.shelfUnits },
    ]
  }

  if (isLayoutGondola(layout)) {
    const { leftEndCap, numberOfLayouts, rightEndCap, sides } = layout

    return [
      ...sides.map(({ shelfUnits }) => ({
        numberOfRuns: numberOfLayouts,
        shelfUnits,
      })),
      ...compact([leftEndCap, rightEndCap]).map(({ shelfUnits }) => ({
        numberOfRuns: END_CAP_RUN_COUNT,
        shelfUnits,
      })),
    ]
  }

  if (isLayoutImpulse(layout)) {
    return listImpulseSideShelfUnits(layout.bays).map((shelfUnits) => ({
      numberOfRuns: layout.numberOfLayouts,
      shelfUnits,
    }))
  }

  return []
}

export function countShelvesByWidth(
  layouts: OfferInput["layouts"],
): { numberOfShelves: number; width: number }[] {
  const numberOfShelvesByWidth = new Map<number, number>()

  for (const { numberOfRuns, shelfUnits } of layouts.flatMap(listShelfRuns)) {
    for (const { numberOfShelfUnits, shelves = [], width } of shelfUnits) {
      const numberOfShelves =
        numberOfRuns *
        numberOfShelfUnits *
        (BASE_SHELVES_PER_UNIT + sumBy("numberOfShelves", shelves))
      const current = numberOfShelvesByWidth.get(width) ?? 0

      numberOfShelvesByWidth.set(width, current + numberOfShelves)
    }
  }

  return Array.from(numberOfShelvesByWidth)
    .filter(([, numberOfShelves]) => numberOfShelves > 0)
    .map(([width, numberOfShelves]) => ({ numberOfShelves, width }))
}
