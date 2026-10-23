import { describe, expect, it } from "vitest"

import { summarizeRunningMetres } from "./summarizeRunningMetres"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("summarizeRunningMetres", () => {
  it("adds strips of every width into one length in metres", () => {
    expect(
      summarizeRunningMetres(
        [
          { id: "price-strip-80", quantity: 4 },
          { id: "price-strip-100", quantity: 2 },
        ],
        componentCatalogMock,
      ),
    ).toEqual({ basePrice: 13.4, quantity: 5.2 })
  })
})
