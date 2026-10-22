import { sumBy } from "lodash/fp"

import { LayoutWall } from "@/schemas/LayoutWall.schema"

import { calculateCoverDemand } from "../../calculations/calculateCoverDemand/calculateCoverDemand"
import { calculateLegDemand } from "../../calculations/calculateLegDemand/calculateLegDemand"
import { Component } from "../../models/component"
import { countShelfUnitsByWidth } from "../../transformations/countShelfUnitsByWidth/countShelfUnitsByWidth"
import { calculateRunSideDemand } from "../calculateRunSideDemand/calculateRunSideDemand"

export function calculateWallLayoutDemand(
  { extras = [], ...layout }: LayoutWall,
  inventory: Component[],
) {
  const { hasTopCover = false, height, numberOfLayouts, shelfUnits } = layout
  const numberOfUnits = sumBy("numberOfShelfUnits", shelfUnits)

  return [
    ...calculateRunSideDemand(layout, inventory),
    ...(hasTopCover
      ? calculateCoverDemand(
          {
            category: "topCover",
            shelfUnitsByWidth: countShelfUnitsByWidth(
              shelfUnits,
              numberOfLayouts,
            ),
          },
          inventory,
        )
      : []),
    ...calculateLegDemand(
      { height, numberOfLayouts, numberOfUnits },
      inventory,
    ),
    ...extras,
  ]
}
