import { describe, expect, it } from "vitest"

import { createDefaultWallLayout } from "./createDefaultWallLayout"

describe("createDefaultWallLayout", () => {
  it("starts at 210 cm high and 47 cm deep with six hanging shelves", () => {
    const layout = createDefaultWallLayout({
      layoutDepths: [25, 37, 47],
      layoutHeights: [130, 210],
      shelfDepths: [30, 37, 47],
      shelfUnitWidths: [80, 100],
    })

    expect(layout).toMatchObject({
      depth: 47,
      height: 210,
      shelfUnits: [{ shelves: [{ depth: 47, numberOfShelves: 6 }] }],
    })
  })
})
