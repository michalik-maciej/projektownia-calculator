import { find } from "lodash/fp"

import { compareComponents } from "@/schemas/inventory/compareComponents"

import { Component, ComponentDemand } from "../../models/component"
import { MissingComponentError } from "../../models/missingComponentError"

type DemandByCategory = Partial<
  Record<
    Component["category"],
    Array<ComponentDemand[number] & { label: string }>
  >
>

export function breakdownDemandByCategory(
  rawDemand: ComponentDemand,
  inventory: Component[],
) {
  const bom: DemandByCategory = {}

  const demandWithComponents = rawDemand.map(({ id, quantity }) => {
    const component = find({ id }, inventory)
    if (!component) {
      throw new MissingComponentError(
        `Component with id "${id}" not found in inventory`,
        { id },
      )
    }
    return { id, quantity, component }
  })

  demandWithComponents.sort((a, b) =>
    compareComponents(a.component, b.component),
  )

  for (const { id, quantity, component } of demandWithComponents) {
    const bucket = bom[component.category] ?? []
    const existing = find({ id }, bucket)

    if (existing) {
      existing.quantity += quantity
    } else {
      bucket.push({
        id,
        quantity,
        label: component.label,
      })
    }

    bom[component.category] = bucket
  }

  return bom
}
