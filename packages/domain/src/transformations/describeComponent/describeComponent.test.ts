import { describe, expect, it } from "vitest"

import { describeComponent } from "./describeComponent"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("describeComponent", () => {
  it("names the component from the inventory, lowercased", () => {
    expect(describeComponent("back-10-100", componentCatalogMock)).toEqual(
      "plecy 10/100",
    )
  })

  it("falls back to the id of a component missing from the inventory", () => {
    expect(describeComponent("gone-component", componentCatalogMock)).toEqual(
      "gone-component",
    )
  })
})
