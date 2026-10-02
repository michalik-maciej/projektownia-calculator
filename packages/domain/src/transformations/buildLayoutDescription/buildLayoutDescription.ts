import { isLayoutGondola } from "@/schemas/LayoutGondola.schema"
import { isLayoutItemSet } from "@/schemas/LayoutItemSet.schema"
import { isLayoutWall } from "@/schemas/LayoutWall.schema"

import { Component } from "../../models/component"
import { describeComponent } from "../describeComponent/describeComponent"

export function buildLayoutDescription(
  layout: unknown,
  inventory: Component[],
) {
  if (isLayoutWall(layout)) {
    const parts: string[] = []

    parts.push("ciąg regałów przyściennych")

    for (const { numberOfShelfUnits, width } of layout.shelfUnits) {
      parts.push(`${numberOfShelfUnits}x${width}`)
    }

    parts.push(`baza ${layout.depth}`)
    parts.push(`h-${layout.height}`)

    const firstShelf = layout.shelfUnits.find((unit) => unit.shelves.length > 0)
      ?.shelves[0]
    if (firstShelf) {
      parts.push(`półki ${firstShelf.numberOfShelves}x${firstShelf.depth}`)
    }

    return parts.join(" / ")
  }

  if (isLayoutGondola(layout)) {
    const parts: string[] = []

    parts.push("ciąg regałów dwustronnych")

    const [{ depth, shelfUnits }] = layout.sides

    for (const { numberOfShelfUnits, width } of shelfUnits) {
      parts.push(`${numberOfShelfUnits}x${width}`)
    }

    parts.push(`baza ${depth}`)
    parts.push(`h-${layout.height}`)

    const firstShelf = shelfUnits.find((unit) => unit.shelves.length > 0)
      ?.shelves[0]
    if (firstShelf) {
      parts.push(`półki ${firstShelf.numberOfShelves}x${firstShelf.depth}`)
    }

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
