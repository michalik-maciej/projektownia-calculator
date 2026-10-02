import { describe, expect, it } from "vitest"

import { describeComponentQuantity } from "./describeComponentQuantity"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("describeComponentQuantity", () => {
  it("names the component from the inventory, lowercased, with its quantity", () => {
    expect(
      describeComponentQuantity(
        { id: "back-10-100", quantity: 3 },
        componentCatalogMock,
      ),
    ).toEqual("plecy 10/100 x3")
  })

  it("falls back to the id of a component missing from the inventory", () => {
    expect(
      describeComponentQuantity(
        { id: "gone-component", quantity: 1 },
        componentCatalogMock,
      ),
    ).toEqual("gone-component x1")
  })
})
