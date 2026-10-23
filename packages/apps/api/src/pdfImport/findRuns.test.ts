import { describe, expect, it } from "vitest"

import { LayoutWall } from "@/schemas/LayoutWall.schema"

import { findRuns } from "./findRuns"
import { DrawingSegment, DrawingText } from "./readDrawing"

const RUN_BLUE = "#007fff"
const LABEL_HEIGHT = 4.5
const NUMBER_HEIGHT = 7.6

function line(x1: number, y1: number, x2: number, y2: number): DrawingSegment {
  return { color: RUN_BLUE, from: { x: x1, y: y1 }, to: { x: x2, y: y2 } }
}

function text(
  value: string,
  x: number,
  y: number,
  { angle = -90, height = LABEL_HEIGHT } = {},
): DrawingText {
  return { angle, height, text: value, x, y }
}

function wallRun(
  number: number,
  { depth, height }: { depth: number; height: number },
  shelfUnits: LayoutWall["shelfUnits"],
) {
  return {
    layout: {
      backVariant: 1,
      depth,
      hasBaseCover: true,
      height,
      numberOfLayouts: 1,
      shelfUnits,
    },
    number,
  }
}

describe("findRuns", () => {
  it("gives each run the labels along its own stretch of a shared line", () => {
    const runs = findRuns({
      segments: [
        line(194.4, 604.8, 194.4, 440.8),
        line(194.4, 693.6, 194.4, 608),
      ],
      texts: [
        text("(5)", 196.6, 527.6, { height: NUMBER_HEIGHT }),
        text("100/37/210", 175.3, 593.2),
        text("6x37", 170.3, 585.3),
        text("100/37/210", 175.3, 538.8),
        text("6x37", 170.3, 530.9),
        text("100/37/210", 175.3, 484.3),
        text("6x37", 170.3, 476.4),
        text("(11)", 196.6, 658, { height: NUMBER_HEIGHT }),
        text("80/37/210", 175.3, 683),
        text("4x37", 170.3, 676.8),
        text("80/37/210", 175.3, 640),
        text("4x37", 170.3, 633.8),
      ],
    })

    expect(runs).toEqual([
      wallRun(5, { depth: 37, height: 210 }, [
        {
          numberOfShelfUnits: 3,
          shelves: [{ depth: 37, numberOfShelves: 6 }],
          width: 100,
        },
      ]),
      wallRun(11, { depth: 37, height: 210 }, [
        {
          numberOfShelfUnits: 2,
          shelves: [{ depth: 37, numberOfShelves: 4 }],
          width: 80,
        },
      ]),
    ])
  })

  it("counts identical runs with the same number as one entry", () => {
    const runs = findRuns({
      segments: [
        line(194.4, 604.8, 194.4, 550),
        line(294.4, 604.8, 294.4, 550),
      ],
      texts: [
        text("(5)", 196.6, 580, { height: NUMBER_HEIGHT }),
        text("100/37/210", 175.3, 593.2),
        text("6x37", 170.3, 585.3),
        text("(5)", 296.6, 580, { height: NUMBER_HEIGHT }),
        text("100/37/210", 275.3, 593.2),
        text("6x37", 270.3, 585.3),
      ],
    })
    const { layout, number } = wallRun(5, { depth: 37, height: 210 }, [
      {
        numberOfShelfUnits: 1,
        shelves: [{ depth: 37, numberOfShelves: 6 }],
        width: 100,
      },
    ])

    expect(runs).toEqual([
      { layout: { ...layout, numberOfLayouts: 2 }, number },
    ])
  })

  it("ignores labels on the far side of the run line", () => {
    const horizontal = { angle: 0, height: 2.7197 }
    const runs = findRuns({
      segments: [line(392.5, 563.5, 294.6, 563.5)],
      texts: [
        text("(3)", 340.7, 564.7, { angle: 0, height: 4.6 }),
        text("100/37/210", 334.6, 581, horizontal),
        text("6x37", 339.5, 577.6, horizontal),
        text("80/37/210", 308.5, 533.8, horizontal),
        text("4x37", 313.4, 530.5, horizontal),
      ],
    })

    expect(runs).toEqual([
      wallRun(3, { depth: 37, height: 210 }, [
        {
          numberOfShelfUnits: 1,
          shelves: [{ depth: 37, numberOfShelves: 6 }],
          width: 100,
        },
      ]),
    ])
  })

  it("keeps a unit without shelves when its label carries other notes", () => {
    const runs = findRuns({
      segments: [line(431.8, 686.5, 431.8, 631.5)],
      texts: [
        text("(12)", 433.9, 665.8, { height: NUMBER_HEIGHT }),
        text("100/37/210", 460.3, 673.4),
        text("2xKP / 3xPP", 454.7, 673.6),
        text("drzwi szklane", 449, 675),
      ],
    })

    expect(runs).toEqual([
      wallRun(12, { depth: 37, height: 210 }, [
        { numberOfShelfUnits: 1, shelves: [], width: 100 },
      ]),
    ])
  })

  it("keeps the shelves of a label marked as perforated", () => {
    const runs = findRuns({
      segments: [line(431.8, 686.5, 431.8, 631.5)],
      texts: [
        text("(12)", 433.9, 665.8, { height: NUMBER_HEIGHT }),
        text("100/37/210", 460.3, 673.4),
        text("7x30 + PERF", 454.7, 673.6),
      ],
    })

    expect(runs).toEqual([
      wallRun(12, { depth: 37, height: 210 }, [
        {
          numberOfShelfUnits: 1,
          shelves: [{ depth: 30, numberOfShelves: 7 }],
          width: 100,
        },
      ]),
    ])
  })

  it("reads a run along a diagonal line", () => {
    const along = { angle: -171 }

    const runs = findRuns({
      segments: [line(273.2, 237.9, 500.3, 277.4)],
      texts: [
        text("(1)", 389.2, 257.5, { angle: -170, height: NUMBER_HEIGHT }),
        text("80/30/210", 448.1, 239.6, along),
        text("7x30", 449.9, 244.9, along),
        text("80/30/210", 401.5, 232.4, along),
        text("7x30", 403.2, 237.7, along),
      ],
    })

    expect(runs).toEqual([
      wallRun(1, { depth: 30, height: 210 }, [
        {
          numberOfShelfUnits: 2,
          shelves: [{ depth: 30, numberOfShelves: 7 }],
          width: 80,
        },
      ]),
    ])
  })

  it("reads cross labels at the ends of a gondola's line as end caps, left before its number", () => {
    const horizontal = { angle: 0 }
    const sideOf80 = (numberOfShelfUnits: number, numberOfShelves: number) => ({
      backVariant: 1,
      depth: 37,
      hasBaseCover: true,
      shelfUnits: [
        {
          numberOfShelfUnits,
          shelves: [{ depth: 37, numberOfShelves }],
          width: 80,
        },
      ],
    })

    const runs = findRuns({
      segments: [line(221, 691.9, 221, 557.4)],
      texts: [
        text("(6)", 223, 629, { height: NUMBER_HEIGHT }),
        text("80/37/170", 249, 615),
        text("5x37", 244, 609),
        text("80/37/170", 249, 659),
        text("5x37", 244, 652),
        text("80/37/170", 273, 615),
        text("5x37", 268, 609),
        text("80/37/170", 273, 659),
        text("5x37", 268, 652),
        text("80/37/170", 248, 685, horizontal),
        text("4x37", 253, 680, horizontal),
        text("80/37/170", 249, 567, horizontal),
        text("3x37", 254, 563, horizontal),
      ],
    })

    expect(runs).toEqual([
      {
        layout: {
          height: 170,
          leftEndCap: sideOf80(1, 4),
          numberOfLayouts: 1,
          rightEndCap: sideOf80(1, 3),
          sides: [sideOf80(2, 5), sideOf80(2, 5)],
        },
        number: 6,
      },
    ])
  })

  it("skips a gondola, with its end caps, when their heights differ", () => {
    const runs = findRuns({
      segments: [line(221, 691.9, 221, 557.4)],
      texts: [
        text("(6)", 223, 629, { height: NUMBER_HEIGHT }),
        text("80/37/170", 249, 615),
        text("5x37", 244, 609),
        text("80/37/170", 273, 615),
        text("5x37", 268, 609),
        text("80/37/210", 248, 685, { angle: 0 }),
        text("5x37", 253, 680, { angle: 0 }),
      ],
    })

    expect(runs).toEqual([])
  })

  it("reads two rows of labels on one side of the line as a gondola, far row first", () => {
    const side = (numberOfShelves: number) => ({
      backVariant: 1,
      depth: 37,
      hasBaseCover: true,
      shelfUnits: [
        {
          numberOfShelfUnits: 2,
          shelves: [{ depth: 37, numberOfShelves }],
          width: 80,
        },
      ],
    })

    const runs = findRuns({
      segments: [line(221, 667, 221, 582)],
      texts: [
        text("(6)", 223, 629, { height: NUMBER_HEIGHT }),
        text("80/37/170", 249, 615),
        text("5x37", 244, 609),
        text("80/37/170", 249, 659),
        text("5x37", 244, 652),
        text("80/37/170", 273, 615),
        text("4x37", 268, 609),
        text("80/37/170", 273, 659),
        text("4x37", 268, 652),
      ],
    })

    expect(runs).toEqual([
      {
        layout: { height: 170, numberOfLayouts: 1, sides: [side(4), side(5)] },
        number: 6,
      },
    ])
  })

  it("skips a run whose units differ in depth or height", () => {
    const runs = findRuns({
      segments: [line(194.4, 604.8, 194.4, 440.8)],
      texts: [
        text("(5)", 196.6, 527.6, { height: NUMBER_HEIGHT }),
        text("100/37/210", 175.3, 593.2),
        text("6x37", 170.3, 585.3),
        text("100/47/210", 175.3, 538.8),
        text("6x37", 170.3, 530.9),
      ],
    })

    expect(runs).toEqual([])
  })
})
