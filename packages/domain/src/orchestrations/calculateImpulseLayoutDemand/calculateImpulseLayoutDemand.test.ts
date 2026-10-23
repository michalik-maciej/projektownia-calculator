import { describe, expect, it } from "vitest"

import { LayoutImpulse } from "@/schemas/LayoutImpulse.schema"

import { calculateImpulseLayoutDemand } from "./calculateImpulseLayoutDemand"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

const impulse: LayoutImpulse = {
  backDepth: 47,
  backVariant: 2,
  baseCoverVariant: 1,
  bays: [{ backShelves: [], frontShelves: 2, height: 90, width: 80 }],
  numberOfLayouts: 1,
}

describe("calculateImpulseLayoutDemand", () => {
  it("puts a back-depth foot and a 30 foot under every leg", () => {
    const result = calculateImpulseLayoutDemand(impulse, componentCatalogMock)

    expect(result).toContainEqual({ id: "foot-47", quantity: 2 })
    expect(result).toContainEqual({ id: "foot-30", quantity: 2 })
  })

  it("hangs front shelves at depth 30 on regular supports", () => {
    const result = calculateImpulseLayoutDemand(impulse, componentCatalogMock)

    expect(result).toContainEqual({ id: "support-30", quantity: 4 })
  })

  it("counts back panels for one side only when the front is a furniture board", () => {
    const result = calculateImpulseLayoutDemand(
      { ...impulse, backVariant: 1 },
      componentCatalogMock,
    )

    expect(result).toContainEqual({ id: "back-40-80", quantity: 2 })
  })

  it("counts one base cover per bay for the front-only variant", () => {
    const result = calculateImpulseLayoutDemand(impulse, componentCatalogMock)

    expect(result).toContainEqual({ id: "base-cover-80", quantity: 1 })
  })
})
