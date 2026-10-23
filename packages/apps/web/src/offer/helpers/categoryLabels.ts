import type { ComponentCategory } from "@/schemas/inventory/Component.schema"

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  back: "Plecy",
  baseCover: "Osłony dolne",
  bentSupport: "Wsporniki gięte",
  foot: "Stopy",
  leg: "Nogi",
  misc: "Inne",
  priceStrip: "Listwy cenowe",
  shelf: "Półki",
  shelfStop: "Ograniczniki",
  support: "Wsporniki",
  topCover: "Maskownice",
}

export const CATEGORY_LABELS_GENITIVE: Record<string, string> = {
  back: "pleców",
  baseCover: "osłony dolnej",
  bentSupport: "wspornika giętego",
  foot: "stopy",
  leg: "nogi",
  misc: "elementu",
  priceStrip: "listwy cenowej",
  shelf: "półki",
  shelfStop: "ogranicznika",
  support: "wspornika",
  topCover: "maskownicy",
}
