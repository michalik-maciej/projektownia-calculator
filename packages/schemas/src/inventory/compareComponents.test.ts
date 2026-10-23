import { describe, expect, it } from "vitest"

import { compareComponents } from "./compareComponents"

function makeComponent(
  overrides: Partial<Parameters<typeof compareComponents>[0]>,
) {
  return {
    category: "shelf" as const,
    label: "label",
    width: null,
    height: null,
    depth: null,
    ...overrides,
  }
}

describe("compareComponents", () => {
  it("orders by width, then depth, then height, ascending", () => {
    const wide = makeComponent({ label: "wide", width: 100, depth: 10 })
    const deep = makeComponent({ label: "deep", width: 50, depth: 40 })
    const tall = makeComponent({
      label: "tall",
      width: 50,
      depth: 10,
      height: 200,
    })
    const short = makeComponent({
      label: "short",
      width: 50,
      depth: 10,
      height: 30,
    })

    expect([wide, deep, tall, short].sort(compareComponents)).toEqual([
      short,
      tall,
      deep,
      wide,
    ])
  })

  it("orders the misc category alphabetically by label, numbers by value", () => {
    const zawias = makeComponent({
      category: "misc",
      label: "Zawias",
      width: 1,
    })
    const lacznik = makeComponent({
      category: "misc",
      label: "Łącznik",
      width: 9,
    })
    const shelf = makeComponent({ label: "Półka", width: 3 })
    const hak80 = makeComponent({ category: "misc", label: "Hak 80", width: 5 })
    const hak100 = makeComponent({
      category: "misc",
      label: "Hak 100",
      width: 4,
    })

    expect(
      [zawias, shelf, hak100, lacznik, hak80].sort(compareComponents),
    ).toEqual([shelf, hak80, hak100, lacznik, zawias])
  })
})
