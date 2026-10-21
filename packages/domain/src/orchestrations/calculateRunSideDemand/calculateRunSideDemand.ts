import { sumBy } from "lodash/fp"

import { GondolaSide } from "@/schemas/LayoutGondola.schema"

import { calculateBackPanelDemand } from "../../calculations/calculateBackPanelDemand/calculateBackPanelDemand"
import { calculateBaseCoverDemand } from "../../calculations/calculateBaseCoverDemand/calculateBaseCoverDemand"
import { calculateBaseShelfDemand } from "../../calculations/calculateBaseShelfDemand/calculateBaseShelfDemand"
import { calculateFootDemand } from "../../calculations/calculateFootDemand/calculateFootDemand"
import { calculateShelfDemand } from "../../calculations/calculateShelfDemand/calculateShelfDemand"
import { calculateTopCoverDemand } from "../../calculations/calculateTopCoverDemand/calculateTopCoverDemand"
import { Component } from "../../models/component"
import { countShelfUnitsByWidth } from "../../transformations/countShelfUnitsByWidth/countShelfUnitsByWidth"

type RunSideCalculationContext = GondolaSide & {
  height: number
  numberOfLayouts: number
}

export function calculateRunSideDemand(
  {
    backVariant,
    depth,
    hasBaseCover = false,
    hasTopCover = false,
    height,
    numberOfLayouts,
    shelfUnits,
  }: RunSideCalculationContext,
  inventory: Component[],
) {
  const shelfUnitsByWidth = countShelfUnitsByWidth(shelfUnits, numberOfLayouts)
  const numberOfUnits = sumBy("numberOfShelfUnits", shelfUnits)

  return [
    ...calculateBackPanelDemand(
      { backVariant, height, shelfUnitsByWidth },
      inventory,
    ),
    ...(hasBaseCover
      ? calculateBaseCoverDemand({ shelfUnitsByWidth }, inventory)
      : []),
    ...(hasTopCover
      ? calculateTopCoverDemand({ shelfUnitsByWidth }, inventory)
      : []),
    ...calculateBaseShelfDemand({ depth, shelfUnitsByWidth }, inventory),
    ...calculateShelfDemand({ shelfUnits, numberOfLayouts }, inventory),
    ...calculateFootDemand(
      { depth, numberOfLayouts, numberOfUnits },
      inventory,
    ),
  ]
}
