import { find } from "lodash/fp"

import {
  IMPULSE_FRONT_DEPTH,
  IMPULSE_LOW_HEIGHT,
} from "@/schemas/LayoutImpulse.schema"

import { Component } from "../../models/component"
import { MissingComponentError } from "../../models/missingComponentError"

const COUNTER_SUPPORT_DEPTH = 37

type BentSupportCalculationContext = {
  bayHeights: number[]
  numberOfLayouts: number
}

export function calculateBentSupportDemand(
  { bayHeights, numberOfLayouts }: BentSupportCalculationContext,
  inventory: Component[],
) {
  const numberOfSetsByDepth = [
    { depth: COUNTER_SUPPORT_DEPTH, numberOfSets: bayHeights.length },
    {
      depth: IMPULSE_FRONT_DEPTH,
      numberOfSets: bayHeights.filter((height) => height === IMPULSE_LOW_HEIGHT)
        .length,
    },
  ]

  return numberOfSetsByDepth
    .filter(({ numberOfSets }) => numberOfSets > 0)
    .map(({ depth, numberOfSets }) => {
      const availableSet = find({ category: "bentSupport", depth }, inventory)

      if (!availableSet) {
        throw new MissingComponentError(
          `No bent support set found for depth ${depth}cm`,
          { category: "bentSupport", depth },
        )
      }

      return { id: availableSet.id, quantity: numberOfSets * numberOfLayouts }
    })
}
