import { describe, expect, it } from "vitest"

import { calculateBentSupportDemand } from "./calculateBentSupportDemand"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("calculateBentSupportDemand", () => {
  it("orders a 37 set for every bay and a 30 set for low bays only", () => {
    const result = calculateBentSupportDemand(
      { bayHeights: [90, 130, 130], numberOfLayouts: 2 },
      componentCatalogMock,
    )

    expect(result).toEqual([
      { id: "bent-support-37", quantity: 6 },
      { id: "bent-support-30", quantity: 2 },
    ])
  })
})
