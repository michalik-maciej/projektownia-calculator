import {
  COMPONENT_CATEGORIES,
  type ComponentCategory,
} from "./Component.schema"

type SortableComponent = {
  category: ComponentCategory
  depth: number | null
  height: number | null
  label: string
  width: number | null
}

function compareNullableNumbers(a: number | null, b: number | null) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return a - b
}

export function compareComponents(a: SortableComponent, b: SortableComponent) {
  if (a.category !== b.category) {
    return (
      COMPONENT_CATEGORIES.indexOf(a.category) -
      COMPONENT_CATEGORIES.indexOf(b.category)
    )
  }
  if (a.category === "misc") {
    return a.label.localeCompare(b.label, "pl", { numeric: true })
  }
  return (
    compareNullableNumbers(a.width, b.width) ||
    compareNullableNumbers(a.depth, b.depth) ||
    compareNullableNumbers(a.height, b.height)
  )
}
