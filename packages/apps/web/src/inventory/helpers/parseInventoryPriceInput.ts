export function parseInventoryPriceInput(value: string): number | null {
  const parsed = Number(value)

  if (!Number.isFinite(parsed) || parsed <= 0) return null

  return parsed
}
