import { compact, sumBy } from "lodash/fp"

import { LayoutGondola } from "@/schemas/LayoutGondola.schema"

import { calculateLegDemand } from "../../calculations/calculateLegDemand/calculateLegDemand"
import { Component } from "../../models/component"
import { calculateRunSideDemand } from "../calculateRunSideDemand/calculateRunSideDemand"
import { calculateWallLayoutDemand } from "../calculateWallLayoutDemand/calculateWallLayoutDemand"

const END_CAP_RUN_COUNT = 1

export function calculateGondolaLayoutDemand(
  {
    extras = [],
    height,
    leftEndCap,
    numberOfLayouts,
    rightEndCap,
    sides,
  }: LayoutGondola,
  inventory: Component[],
) {
  // Shared uprights; extra legs for mismatched sides come in as extras.
  const numberOfUnits = Math.max(
    ...sides.map(({ shelfUnits }) => sumBy("numberOfShelfUnits", shelfUnits)),
  )

  return [
    ...sides.flatMap((side) =>
      calculateRunSideDemand({ ...side, height, numberOfLayouts }, inventory),
    ),
    ...calculateLegDemand(
      { height, numberOfLayouts, numberOfUnits },
      inventory,
    ),
    ...compact([leftEndCap, rightEndCap]).flatMap((endCap) =>
      calculateWallLayoutDemand(
        { ...endCap, height, numberOfLayouts: END_CAP_RUN_COUNT },
        inventory,
      ),
    ),
    ...extras,
  ]
}
