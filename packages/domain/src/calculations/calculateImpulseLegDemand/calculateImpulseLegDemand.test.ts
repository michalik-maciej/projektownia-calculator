import { describe, expect, it } from "vitest"

import { calculateImpulseLegDemand } from "./calculateImpulseLegDemand"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("calculateImpulseLegDemand", () => {
  it("gives the leg shared by a low and a high bay the taller height", () => {
    const result = calculateImpulseLegDemand(
      { bayHeights: [90, 130], numberOfLayouts: 1 },
      componentCatalogMock,
    )

    expect(result).toEqual([
      { id: "leg-90-8-3", quantity: 1 },
      { id: "leg-130-8-3", quantity: 2 },
    ])
  })
})
