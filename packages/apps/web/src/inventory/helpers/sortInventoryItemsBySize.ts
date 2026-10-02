import type { InventoryItem } from "../inventory.api"

function compareNullableNumbers(a: number | null, b: number | null) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return a - b
}

export function sortInventoryItemsBySize(
  items: InventoryItem[],
): InventoryItem[] {
  return [...items].sort(
    (a, b) =>
      compareNullableNumbers(a.width, b.width) ||
      compareNullableNumbers(a.height, b.height) ||
      compareNullableNumbers(a.depth, b.depth),
  )
}
