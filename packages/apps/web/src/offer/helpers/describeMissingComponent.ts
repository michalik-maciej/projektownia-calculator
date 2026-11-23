import * as v from "valibot"

import { ComponentCategorySchema } from "@/schemas/inventory/Component.schema"
import { MissingComponent } from "@/schemas/OfferError.schema"

import { CATEGORY_LABELS_GENITIVE } from "./categoryLabels"

const DIMENSION_LABELS = [
  ["width", "szer."],
  ["depth", "gł."],
  ["height", "wys."],
] as const

export function describeMissingComponent(missing: MissingComponent): string {
  if (missing.id) {
    return `Brak w katalogu komponentu o identyfikatorze ${missing.id}`
  }

  const what = v.is(ComponentCategorySchema, missing.category)
    ? CATEGORY_LABELS_GENITIVE[missing.category]
    : "elementu"

  const dimensions = DIMENSION_LABELS.flatMap(([key, label]) => {
    const value = missing[key]
    return value == null ? [] : [`${label} ${value}`]
  }).join(", ")

  return dimensions
    ? `Brak w katalogu ${what} o wymiarach ${dimensions}`
    : `Brak w katalogu ${what}`
}
