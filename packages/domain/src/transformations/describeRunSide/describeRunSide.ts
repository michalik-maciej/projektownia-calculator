import { GondolaSide } from "@/schemas/LayoutGondola.schema"

type RunSideDescriptionContext = Pick<GondolaSide, "depth" | "shelfUnits"> & {
  height?: number
}

export function describeRunSide({
  depth,
  height,
  shelfUnits,
}: RunSideDescriptionContext) {
  const parts = shelfUnits.map(
    ({ numberOfShelfUnits, width }) => `${numberOfShelfUnits}x${width}`,
  )

  parts.push(`baza ${depth}`)

  if (height !== undefined) {
    parts.push(`h-${height}`)
  }

  const firstShelf = shelfUnits.find((unit) => unit.shelves.length > 0)
    ?.shelves[0]

  if (firstShelf) {
    parts.push(`półki ${firstShelf.numberOfShelves}x${firstShelf.depth}`)
  }

  return parts
}
