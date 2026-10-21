import { describe, expect, it } from "vitest"

import { summarizePriceStrips } from "./summarizePriceStrips"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("summarizePriceStrips", () => {
  it("adds strips of every width into one length in metres", () => {
    expect(
      summarizePriceStrips(
        [
          { id: "price-strip-80", quantity: 4 },
          { id: "price-strip-100", quantity: 2 },
        ],
        componentCatalogMock,
      ),
    ).toEqual({ basePrice: 13.4, quantity: 5.2 })
  })
})
