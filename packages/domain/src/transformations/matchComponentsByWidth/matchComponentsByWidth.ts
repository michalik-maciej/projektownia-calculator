import { find } from "lodash/fp"

import { ComponentCategory } from "@/schemas/inventory/Component.schema"

import { Component, ComponentDemand } from "../../models/component"
import { MissingComponentError } from "../../models/missingComponentError"

export function matchComponentsByWidth(
  category: ComponentCategory,
  quantitiesByWidth: { quantity: number; width: number }[],
  inventory: Component[],
): ComponentDemand {
  return quantitiesByWidth.map(({ quantity, width }) => {
    const component = find({ category, width }, inventory)

    if (!component) {
      throw new MissingComponentError(
        `No ${category} found for width ${width}cm`,
        { category, width },
      )
    }

    return { id: component.id, quantity }
  })
}
