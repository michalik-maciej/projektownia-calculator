import { uniq } from "lodash/fp"

import {
  IMPULSE_FRONT_DEPTH,
  ImpulseBay,
  LayoutImpulse,
} from "@/schemas/LayoutImpulse.schema"

import { calculateBackPanelDemand } from "../../calculations/calculateBackPanelDemand/calculateBackPanelDemand"
import { calculateBaseShelfDemand } from "../../calculations/calculateBaseShelfDemand/calculateBaseShelfDemand"
import { calculateBentSupportDemand } from "../../calculations/calculateBentSupportDemand/calculateBentSupportDemand"
import { calculateCoverDemand } from "../../calculations/calculateCoverDemand/calculateCoverDemand"
import { calculateFootDemand } from "../../calculations/calculateFootDemand/calculateFootDemand"
import { calculateImpulseLegDemand } from "../../calculations/calculateImpulseLegDemand/calculateImpulseLegDemand"
import { calculateShelfDemand } from "../../calculations/calculateShelfDemand/calculateShelfDemand"
import { Component } from "../../models/component"
import { countShelfUnitsByWidth } from "../../transformations/countShelfUnitsByWidth/countShelfUnitsByWidth"
import { listImpulseSideShelfUnits } from "../../transformations/listImpulseSideShelfUnits/listImpulseSideShelfUnits"

export function calculateImpulseLayoutDemand(
  {
    backDepth,
    backVariant,
    baseCoverVariant,
    bays,
    extras = [],
    numberOfLayouts,
  }: LayoutImpulse,
  inventory: Component[],
) {
  const bayHeights = bays.map(({ height }) => height)
  const countBaysByWidth = (selectedBays: ImpulseBay[]) =>
    countShelfUnitsByWidth(
      selectedBays.map(({ width }) => ({ numberOfShelfUnits: 1, width })),
      numberOfLayouts,
    )
  const shelfUnitsByWidth = countBaysByWidth(bays)

  return [
    ...uniq(bayHeights).flatMap((height) =>
      calculateBackPanelDemand(
        {
          backVariant,
          height,
          shelfUnitsByWidth: countBaysByWidth(
            bays.filter((bay) => bay.height === height),
          ),
        },
        inventory,
      ),
    ),
    ...(baseCoverVariant > 0
      ? calculateCoverDemand(
          { category: "baseCover", shelfUnitsByWidth },
          inventory,
        ).map(({ id, quantity }) => ({
          id,
          quantity: quantity * baseCoverVariant,
        }))
      : []),
    ...[backDepth, IMPULSE_FRONT_DEPTH].flatMap((depth) => [
      ...calculateBaseShelfDemand({ depth, shelfUnitsByWidth }, inventory),
      ...calculateFootDemand(
        { depth, numberOfLayouts, numberOfUnits: bays.length },
        inventory,
      ),
    ]),
    ...calculateShelfDemand(
      { numberOfLayouts, shelfUnits: listImpulseSideShelfUnits(bays).flat() },
      inventory,
    ),
    ...calculateImpulseLegDemand({ bayHeights, numberOfLayouts }, inventory),
    ...calculateBentSupportDemand({ bayHeights, numberOfLayouts }, inventory),
    ...extras,
  ]
}
