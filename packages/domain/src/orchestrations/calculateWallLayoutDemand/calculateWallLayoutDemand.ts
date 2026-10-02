import { sumBy } from "lodash/fp"

import { LayoutWall } from "@/schemas/LayoutWall.schema"

import { calculateLegDemand } from "../../calculations/calculateLegDemand/calculateLegDemand"
import { Component } from "../../models/component"
import { calculateRunSideDemand } from "../calculateRunSideDemand/calculateRunSideDemand"

export function calculateWallLayoutDemand(
  { extras = [], ...layout }: LayoutWall,
  inventory: Component[],
) {
  const { height, numberOfLayouts, shelfUnits } = layout
  const numberOfUnits = sumBy("numberOfShelfUnits", shelfUnits)

  return [
    ...calculateRunSideDemand(layout, inventory),
    ...calculateLegDemand(
      { height, numberOfLayouts, numberOfUnits },
      inventory,
    ),
    ...extras,
  ]
}
