import { describe, expect, it } from "vitest"

import { matchComponentsByWidth } from "./matchComponentsByWidth"
import { componentCatalogMock } from "../../fixtures/componentCatalog"
import { MissingComponentError } from "../../models/missingComponentError"

describe("matchComponentsByWidth", () => {
  it("assigns each quantity to the component of the category with that width", () => {
    const result = matchComponentsByWidth(
      "priceStrip",
      [
        { quantity: 4, width: 80 },
        { quantity: 2, width: 100 },
      ],
      componentCatalogMock,
    )

    expect(result).toEqual([
      { id: "price-strip-80", quantity: 4 },
      { id: "price-strip-100", quantity: 2 },
    ])
  })

  it("throws a missing component error when no component has the width", () => {
    expect(() =>
      matchComponentsByWidth(
        "priceStrip",
        [{ quantity: 1, width: 55 }],
        componentCatalogMock,
      ),
    ).toThrow(MissingComponentError)
  })
})
