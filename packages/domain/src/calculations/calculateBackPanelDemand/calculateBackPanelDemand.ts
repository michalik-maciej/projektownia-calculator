import { filter, orderBy } from "lodash/fp"

import { DEFAULT_BACK_VARIANT } from "@/schemas/LayoutWall.schema"

import { Component, ComponentDemand } from "../../models/component"
import { MissingComponentError } from "../../models/missingComponentError"
import { ShelfUnit } from "../../models/shelfUnit"

type BackPanelCalculationContext = {
  backVariant?: number
  height: number
  shelfUnitsByWidth: ShelfUnit[]
}

export function calculateBackPanelDemand(
  {
    backVariant = DEFAULT_BACK_VARIANT,
    height,
    shelfUnitsByWidth,
  }: BackPanelCalculationContext,
  inventory: Component[],
) {
  const BACK_CLEARANCE_CM = 10
  const demand: ComponentDemand = []

  if (backVariant === 0) return demand

  for (const { width, numberOfShelfUnits } of shelfUnitsByWidth) {
    const availableBackPanels = orderBy(
      ["height"],
      ["desc"],
      filter({ category: "back", width }, inventory),
    )

    if (availableBackPanels.length === 0) {
      throw new MissingComponentError(
        `No back panels found for width ${width}cm`,
        { category: "back", width },
      )
    }

    let remainder = height - BACK_CLEARANCE_CM

    for (const { id, height: panelHeight } of availableBackPanels) {
      if (!panelHeight || remainder < panelHeight) continue

      const countPerShelfUnit = Math.floor(remainder / panelHeight)

      demand.push({
        id,
        quantity: numberOfShelfUnits * countPerShelfUnit * backVariant,
      })

      remainder %= panelHeight
    }
  }

  return demand
}
