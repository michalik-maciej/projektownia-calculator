import { describe, expect, it } from "vitest"

import { parseInventoryPriceInput } from "./parseInventoryPriceInput"

describe("parseInventoryPriceInput", () => {
  it("parses a valid positive price", () => {
    expect(parseInventoryPriceInput("12.5")).toBe(12.5)
  })

  it("rejects zero and negative values", () => {
    expect(parseInventoryPriceInput("0")).toBeNull()
    expect(parseInventoryPriceInput("-5")).toBeNull()
  })

  it("rejects non-numeric and empty input", () => {
    expect(parseInventoryPriceInput("abc")).toBeNull()
    expect(parseInventoryPriceInput("")).toBeNull()
  })
})
