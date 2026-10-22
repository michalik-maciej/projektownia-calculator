import { describe, expect, it } from "vitest"

import { createDefaultGondolaLayout } from "./createDefaultGondolaLayout"

describe("createDefaultGondolaLayout", () => {
  it("starts a gondola with an end cap on both ends", () => {
    const layout = createDefaultGondolaLayout({
      layoutDepths: [25, 37, 47],
      layoutHeights: [130, 210],
      shelfDepths: [30, 37, 47],
      shelfUnitWidths: [80, 100],
    })

    expect(layout?.leftEndCap).toBeDefined()
    expect(layout?.rightEndCap).toBeDefined()
  })
})
