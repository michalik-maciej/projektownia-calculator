import { compact, uniq } from "lodash/fp"

import { isLayoutGondola } from "@/schemas/LayoutGondola.schema"
import { isLayoutItemSet } from "@/schemas/LayoutItemSet.schema"
import { isLayoutWall } from "@/schemas/LayoutWall.schema"

import { Component } from "../../models/component"
import { ShelfUnit } from "../../models/shelfUnit"
import { countShelfUnitsByWidth } from "../countShelfUnitsByWidth/countShelfUnitsByWidth"
import { describeComponent } from "../describeComponent/describeComponent"
import { describeFirstShelf } from "../describeFirstShelf/describeFirstShelf"

const SEPARATOR = " · "

const describeUnitWidths = (shelfUnits: ShelfUnit[]) =>
  shelfUnits
    .map(({ numberOfShelfUnits, width }) => `${numberOfShelfUnits}×${width}`)
    .join(" + ")

export function buildLayoutDescription(
  layout: unknown,
  inventory: Component[],
) {
  if (isLayoutWall(layout)) {
    const { depth, height, shelfUnits } = layout
    const firstShelf = describeFirstShelf(shelfUnits)

    return compact([
      `H${height}`,
      `B${depth}`,
      describeUnitWidths(shelfUnits),
      firstShelf && `półki ${firstShelf}`,
    ]).join(SEPARATOR)
  }

  if (isLayoutGondola(layout)) {
    const { height, leftEndCap, rightEndCap, sides } = layout
    const depths = uniq(sides.map(({ depth }) => depth))
    const shelves = uniq(
      compact(sides.map(({ shelfUnits }) => describeFirstShelf(shelfUnits))),
    )
    const endCaps = compact(
      [leftEndCap, rightEndCap].map((endCap) => {
        const unit = endCap?.shelfUnits[0]

        return endCap && unit && `szczyt ${unit.width}/${endCap.depth}`
      }),
    )
    const [firstEndCap, secondEndCap] = endCaps
    const unitsByWidth = countShelfUnitsByWidth(
      sides.flatMap(({ shelfUnits }) => shelfUnits),
      1,
    )

    return compact([
      `H${height}`,
      `B${depths.join("/")}`,
      describeUnitWidths(unitsByWidth),
      shelves.length > 0 && `półki ${shelves.join("/")}`,
      ...(firstEndCap && firstEndCap === secondEndCap
        ? [`2× ${firstEndCap}`]
        : endCaps),
    ]).join(SEPARATOR)
  }

  if (isLayoutItemSet(layout)) {
    const items = layout.items.map(({ id }) => describeComponent(id, inventory))

    if (items.length === 0) return "pusty"

    return items.join(", ")
  }

  return "opis niedostępny"
}
