import { describe, expect, it } from "vitest"

import { formatPrice } from "./formatPrice"

describe("formatPrice", () => {
  it("formats a value as Polish złoty", () => {
    expect(formatPrice(1234.5)).toBe("1234,50 zł")
  })

  it("rounds to two decimal places", () => {
    expect(formatPrice(10)).toBe("10,00 zł")
  })
})
