import { OfferInput } from "@/schemas/Offer.schema"

import { Component, ComponentDemand } from "../../models/component"
import { calculateLayoutDemand } from "../calculateLayoutDemand/calculateLayoutDemand"

type OfferDemandCalculationContext = {
  layouts: OfferInput["layouts"]
}

export function calculateOfferDemand(
  { layouts }: OfferDemandCalculationContext,
  inventory: Component[],
) {
  const rawDemand = layouts.flatMap((layout) =>
    calculateLayoutDemand(layout, inventory),
  )

  const map = new Map<string, ComponentDemand[number]>()
  for (const item of rawDemand) {
    const existing = map.get(item.id)

    if (!existing) {
      map.set(item.id, { ...item })
      continue
    }

    map.set(item.id, {
      ...existing,
      quantity: existing.quantity + item.quantity,
    })
  }

  return Array.from(map.values())
}
