import { describe, expect, it } from "vitest"

import { isLayoutGondola } from "./LayoutGondola.schema"
import { isLayoutImpulse } from "./LayoutImpulse.schema"
import { isLayoutWall } from "./LayoutWall.schema"

describe("isLayoutImpulse", () => {
  it("recognises an impulse as neither a wall run nor a gondola", () => {
    const impulse = {
      backDepth: 47,
      backVariant: 2,
      baseCoverVariant: 1,
      bays: [{ backShelves: [], frontShelves: 2, height: 90, width: 80 }],
      numberOfLayouts: 1,
    }

    expect([
      isLayoutImpulse(impulse),
      isLayoutWall(impulse),
      isLayoutGondola(impulse),
    ]).toEqual([true, false, false])
  })
})
