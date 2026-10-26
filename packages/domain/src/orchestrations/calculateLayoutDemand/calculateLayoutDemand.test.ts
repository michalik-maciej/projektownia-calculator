import { describe, expect, it } from "vitest"

import { calculateLayoutDemand } from "./calculateLayoutDemand"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("calculateLayoutDemand", () => {
  it("takes an item set's items as its demand", () => {
    const items = [
      { id: "foot-47", quantity: 3 },
      { id: "misc-inne-3-240-3", quantity: 2 },
    ]

    expect(calculateLayoutDemand({ items }, componentCatalogMock)).toEqual(
      items,
    )
  })
})
