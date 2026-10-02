import { describe, expect, it } from "vitest"

import { sortInventoryItemsBySize } from "./sortInventoryItemsBySize"
import type { InventoryItem } from "../inventory.api"

function makeItem(overrides: Partial<InventoryItem>): InventoryItem {
  return {
    id: "id",
    category: "shelf",
    label: "label",
    price: 0,
    width: null,
    height: null,
    depth: null,
    ...overrides,
  }
}

describe("sortInventoryItemsBySize", () => {
  it("sorts ascending by width first", () => {
    const wide = makeItem({ id: "wide", width: 100 })
    const narrow = makeItem({ id: "narrow", width: 50 })

    expect(sortInventoryItemsBySize([wide, narrow])).toEqual([narrow, wide])
  })

  it("falls back to height, then depth, when width ties", () => {
    const tallDeep = makeItem({
      id: "tall-deep",
      width: 50,
      height: 100,
      depth: 40,
    })
    const tallShallow = makeItem({
      id: "tall-shallow",
      width: 50,
      height: 100,
      depth: 10,
    })
    const short = makeItem({ id: "short", width: 50, height: 30, depth: 99 })

    expect(sortInventoryItemsBySize([tallDeep, tallShallow, short])).toEqual([
      short,
      tallShallow,
      tallDeep,
    ])
  })

  it("sorts items missing a dimension after items that have it", () => {
    const withWidth = makeItem({ id: "with-width", width: 20 })
    const withoutWidth = makeItem({ id: "without-width", width: null })

    expect(sortInventoryItemsBySize([withoutWidth, withWidth])).toEqual([
      withWidth,
      withoutWidth,
    ])
  })

  it("does not mutate the input array", () => {
    const items = [
      makeItem({ id: "b", width: 2 }),
      makeItem({ id: "a", width: 1 }),
    ]
    const original = [...items]

    sortInventoryItemsBySize(items)

    expect(items).toEqual(original)
  })
})
