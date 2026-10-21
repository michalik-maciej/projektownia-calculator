import type { ComponentCategory } from "@/schemas/inventory/Component.schema"

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  back: "Plecy",
  baseCover: "Osłony dolne",
  foot: "Stopy",
  leg: "Nogi",
  misc: "Inne",
  shelf: "Półki",
  support: "Wsporniki",
  topCover: "Maskownice",
}

export const CATEGORY_LABELS_GENITIVE: Record<string, string> = {
  back: "pleców",
  baseCover: "osłony dolnej",
  foot: "stopy",
  leg: "nogi",
  misc: "elementu",
  shelf: "półki",
  support: "wspornika",
  topCover: "maskownicy",
}
