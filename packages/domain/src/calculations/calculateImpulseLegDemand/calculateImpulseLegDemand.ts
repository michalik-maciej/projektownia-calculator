import { find } from "lodash/fp"

import { Component } from "../../models/component"
import { MissingComponentError } from "../../models/missingComponentError"

type ImpulseLegCalculationContext = {
  bayHeights: number[]
  numberOfLayouts: number
}

export function calculateImpulseLegDemand(
  { bayHeights, numberOfLayouts }: ImpulseLegCalculationContext,
  inventory: Component[],
) {
  const legHeights = [
    ...bayHeights.map((height, index) =>
      Math.max(height, bayHeights[index - 1] ?? height),
    ),
    ...bayHeights.slice(-1),
  ]
  const numberOfLegsByHeight = new Map<number, number>()

  for (const height of legHeights) {
    numberOfLegsByHeight.set(
      height,
      (numberOfLegsByHeight.get(height) ?? 0) + 1,
    )
  }

  return Array.from(numberOfLegsByHeight, ([height, numberOfLegs]) => {
    const availableLeg = find({ category: "leg", height }, inventory)

    if (!availableLeg) {
      throw new MissingComponentError(`No leg found for height ${height}cm`, {
        category: "leg",
        height,
      })
    }

    return { id: availableLeg.id, quantity: numberOfLegs * numberOfLayouts }
  })
}
