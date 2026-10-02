import { isLayoutGondola } from "@/schemas/LayoutGondola.schema"
import { isLayoutItemSet } from "@/schemas/LayoutItemSet.schema"
import { isLayoutWall } from "@/schemas/LayoutWall.schema"

import { Component } from "../../models/component"
import { describeComponent } from "../describeComponent/describeComponent"
import { describeRunSide } from "../describeRunSide/describeRunSide"

export function buildLayoutDescription(
  layout: unknown,
  inventory: Component[],
) {
  if (isLayoutWall(layout)) {
    return ["ciąg regałów przyściennych", ...describeRunSide(layout)].join(
      " / ",
    )
  }

  if (isLayoutGondola(layout)) {
    const { height } = layout
    const [firstSide, secondSide] = layout.sides
    const firstSideParts = describeRunSide(firstSide)
    const secondSideParts = describeRunSide(secondSide)
    const isSymmetric = firstSideParts.join() === secondSideParts.join()

    const parts = isSymmetric
      ? [
          "ciąg regałów dwustronnych",
          ...describeRunSide({ ...firstSide, height }),
        ]
      : [
          "ciąg regałów dwustronnych",
          `strona 1: ${firstSideParts.join(" / ")}`,
          `strona 2: ${secondSideParts.join(" / ")}`,
          `h-${height}`,
        ]

    const endCaps = [
      ["lewy", layout.leftEndCap],
      ["prawy", layout.rightEndCap],
    ] as const

    for (const [side, endCap] of endCaps) {
      const unit = endCap?.shelfUnits[0]

      if (endCap && unit) {
        parts.push(`szczyt ${side} ${unit.width}/${endCap.depth}`)
      }
    }

    return parts.join(" / ")
  }

  if (isLayoutItemSet(layout)) {
    const items = layout.items.map(({ id }) => describeComponent(id, inventory))

    if (items.length === 0) return "zestaw elementów"

    return `zestaw elementów: ${items.join(", ")}`
  }

  return "opis niedostępny"
}
