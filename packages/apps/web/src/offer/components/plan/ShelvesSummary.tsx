import { Fragment } from "react"

import { LayoutWall } from "@/schemas/LayoutWall.schema"

export function ShelvesSummary({
  highlightedIndex,
  shelves,
}: {
  highlightedIndex: number | null
  shelves: LayoutWall["shelfUnits"][number]["shelves"]
}) {
  if (shelves.length === 0) {
    return "bez półek"
  }

  return shelves.map(({ depth, numberOfShelves }, shelfIndex) => (
    <Fragment key={shelfIndex}>
      {shelfIndex > 0 && " + "}
      <span className={shelfIndex === highlightedIndex ? "font-semibold" : ""}>
        {numberOfShelves}×{depth}
      </span>
    </Fragment>
  ))
}
