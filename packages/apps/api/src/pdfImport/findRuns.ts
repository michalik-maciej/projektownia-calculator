import {
  countBy,
  every,
  filter,
  flatMap,
  isEqual,
  map,
  maxBy,
  minBy,
  partition,
  sortBy,
  sumBy,
  uniqBy,
  uniqWith,
  zip,
} from "lodash/fp"

import { GondolaSide, LayoutGondola } from "@/schemas/LayoutGondola.schema"
import {
  IMPULSE_BACK_DEPTHS,
  IMPULSE_HIGH_HEIGHT,
  IMPULSE_LOW_HEIGHT,
  ImpulseBay,
  LayoutImpulse,
} from "@/schemas/LayoutImpulse.schema"
import { DEFAULT_BACK_VARIANT, LayoutWall } from "@/schemas/LayoutWall.schema"

import { Drawing, DrawingSegment, DrawingText, Point } from "./readDrawing"

export type Run = {
  layout: LayoutGondola | LayoutImpulse | LayoutWall
  number: number
}

type Shaft = {
  angle: number
  direction: Point
  end: number
  offset: number
  start: number
}

type NumberedShaft = { number: number; numberText: DrawingText; shaft: Shaft }

type SidedShaft = NumberedShaft & { side: number }

type LabelledRun = SidedShaft & { rows: UnitLabel[][] }

type EndCaps = { left: UnitLabel[]; right: UnitLabel[] }

type Shelf = LayoutWall["shelfUnits"][number]["shelves"][number]

type PlacedLabel = {
  angle: number
  position: Point
  textHeight: number
}

type UnitLabel = PlacedLabel & {
  depth: number
  height: number
  shelves: Shelf[]
  width: number
}

type ImpulseLabel = PlacedLabel & {
  depth: number
  height?: ImpulseBay["height"]
  shelves: Shelf[]
  width: number
}

const MAX_RUN_RED = 0x40
const MIN_RUN_BLUE = 0xc0
const HEX_RADIX = 16
const PARALLEL_TOLERANCE_DEGREES = 2
const HALF_TURN_DEGREES = 180
const MIN_SHAFT_LENGTH_PT = 10
const MAX_NUMBER_DISTANCE_PT = 6
const LABEL_REACH_IN_TEXT_HEIGHTS = 3
const TEXT_HEIGHT_TOLERANCE = 0.005
const LABEL_DISTANCE_IN_TEXT_HEIGHTS = 13
const ROW_TOLERANCE_IN_TEXT_HEIGHTS = 1
const GONDOLA_ROWS = 2
const END_CAP_REACH_IN_TEXT_HEIGHTS = 6
const RADIANS_PER_DEGREE = Math.PI / 180
const LAYOUTS_PER_RUN = 1

const RUN_NUMBER = /^\((\d+)\)$/
const UNIT_DIMENSIONS = /^(\d+)\/(\d+)\/(\d+)$/
const UNIT_SHELVES = /^(\d+)x(\d+)(?:\s*\+\s*PERF)?$/
const IMPULSE_UNIT = /^(?:h-(\d+)\s+)?(\d+)\/(\d+)(?:\/(\d+)x(\d+))?$/
const IMPULSE_HEIGHT_NOTE = /^h-(\d+)$/
const IMPULSE_HEIGHTS = [IMPULSE_LOW_HEIGHT, IMPULSE_HIGH_HEIGHT] as const
const IMPULSE_BACK_ROW_IN_TEXT_HEIGHTS = 5
const IMPULSE_BACK_VARIANT = 2
const IMPULSE_BASE_COVER_VARIANT = 1

export function findRuns({ segments, texts }: Drawing): Run[] {
  const labels = findUnitLabels(texts)
  const impulseLabels = findImpulseLabels(texts)
  const sidedShafts = map(
    (numbered: NumberedShaft) => ({
      ...numbered,
      side: labelSideOf(numbered.shaft, [...labels, ...impulseLabels]),
    }),
    findNumberedShafts(texts, findShafts(segments)),
  )
  const labelledRuns = map(
    (sided: SidedShaft) => ({
      ...sided,
      rows: splitIntoRows(
        sided.shaft,
        filter(
          (label) => findShaftOfLabel(label, sidedShafts) === sided.shaft,
          labels,
        ),
      ),
    }),
    sidedShafts,
  )

  const unassignedLabels = filter(
    (label) => !findShaftOfLabel(label, sidedShafts),
    labels,
  )
  const gondolas = map(
    (run: LabelledRun) => ({ caps: findEndCaps(run, unassignedLabels), run }),
    filter(({ rows }) => rows.length === GONDOLA_ROWS, labelledRuns),
  )
  const wallRuns = filter(({ rows }) => rows.length === 1, labelledRuns)
  const impulseRuns = flatMap((sided: SidedShaft) => {
    const front = filter(
      (label) =>
        label.height !== undefined &&
        findShaftOfLabel(label, sidedShafts) === sided.shaft,
      impulseLabels,
    )
    return toImpulseRun(
      sided,
      front,
      findImpulseBackRow(sided, front, impulseLabels),
    )
  }, sidedShafts)

  return mergeIdenticalRuns(
    sortBy("number", [
      ...flatMap(toGondolaRun, gondolas),
      ...flatMap(toWallRun, wallRuns),
      ...impulseRuns,
    ]),
  )
}

function findImpulseBackRow(
  { shaft, side }: SidedShaft,
  front: ImpulseLabel[],
  labels: ImpulseLabel[],
) {
  const frontDistance = Math.max(
    ...front.map(({ position }) => distanceToShaft(position, shaft)),
  )

  return filter((label: ImpulseLabel) => {
    const distance = distanceToShaft(label.position, shaft)
    return (
      label.height === undefined &&
      isParallel(label.angle, shaft.angle) &&
      Math.sign(offsetFromShaft(label.position, shaft)) === side &&
      distance > frontDistance &&
      distance <=
        frontDistance + label.textHeight * IMPULSE_BACK_ROW_IN_TEXT_HEIGHTS
    )
  }, labels)
}

function toImpulseRun(
  { number, numberText }: SidedShaft,
  front: ImpulseLabel[],
  back: ImpulseLabel[],
): Run[] {
  const byPosition = sortBy(({ position }: ImpulseLabel) =>
    readingPosition(position, numberText),
  )
  const bays = zip(byPosition(front), byPosition(back))
  const backDepth = IMPULSE_BACK_DEPTHS.find(
    (depth) => depth === back[0]?.depth,
  )
  const isImpulseRun =
    front.length > 0 &&
    front.length === back.length &&
    backDepth !== undefined &&
    every(
      ([frontLabel, backLabel]) =>
        frontLabel?.width === backLabel?.width &&
        backLabel?.depth === backDepth,
      bays,
    )

  if (!isImpulseRun) return []

  return [
    {
      layout: {
        backDepth,
        backVariant: IMPULSE_BACK_VARIANT,
        baseCoverVariant: IMPULSE_BASE_COVER_VARIANT,
        bays: flatMap(
          ([frontLabel, backLabel]) =>
            frontLabel?.height && backLabel
              ? [
                  {
                    backShelves: backLabel.shelves,
                    frontShelves: sumBy("numberOfShelves", frontLabel.shelves),
                    height: frontLabel.height,
                    width: frontLabel.width,
                  },
                ]
              : [],
          bays,
        ),
        numberOfLayouts: LAYOUTS_PER_RUN,
      },
      number,
    },
  ]
}

function mergeIdenticalRuns(runs: Run[]): Run[] {
  const runKey = (run: Run) => JSON.stringify(run)
  const runCounts = countBy(runKey, runs)

  return map(
    (run: Run) => ({
      ...run,
      layout: {
        ...run.layout,
        numberOfLayouts: runCounts[runKey(run)] ?? LAYOUTS_PER_RUN,
      },
    }),
    uniqBy(runKey, runs),
  )
}

function toGondolaRun({
  caps,
  run,
}: {
  caps: EndCaps
  run: LabelledRun
}): Run[] {
  const [nearRow = [], farRow = []] = run.rows
  const layout = toLayoutGondola(nearRow, farRow, caps)
  return layout ? [{ layout, number: run.number }] : []
}

function toWallRun({ number, rows }: LabelledRun): Run[] {
  const [labels = []] = rows
  const [first] = labels
  const isWallRun =
    first &&
    every(
      ({ depth, height }) => depth === first.depth && height === first.height,
      labels,
    )

  return isWallRun ? [{ layout: toLayoutWall(first, labels), number }] : []
}

function findEndCaps(gondola: LabelledRun, labels: UnitLabel[]): EndCaps {
  const { numberText, rows, shaft, side } = gondola
  const [, farRow = []] = rows
  const farthest = maxBy(
    ({ position }) => distanceToShaft(position, shaft),
    farRow,
  )
  const gondolaDepth = farthest ? distanceToShaft(farthest.position, shaft) : 0

  const endCapLabels = filter((label: UnitLabel) => {
    const along = alongShaft(label.position, shaft)
    const across = offsetFromShaft(label.position, shaft) * side
    const fromNearestEnd = Math.min(along - shaft.start, shaft.end - along)
    const isNearEnd =
      fromNearestEnd >= 0 &&
      fromNearestEnd <= label.textHeight * END_CAP_REACH_IN_TEXT_HEIGHTS
    const isWithinGondola =
      across >= -label.textHeight && across <= gondolaDepth + label.textHeight

    return !isParallel(label.angle, shaft.angle) && isNearEnd && isWithinGondola
  }, labels)

  const [left, right] = partition(
    ({ position }) => readingPosition(position, numberText) < 0,
    endCapLabels,
  )
  return { left, right }
}

function readingPosition({ x, y }: Point, { angle, ...origin }: DrawingText) {
  const direction = angle * RADIANS_PER_DEGREE
  return (
    (x - origin.x) * Math.cos(direction) + (y - origin.y) * Math.sin(direction)
  )
}

function findShafts(segments: DrawingSegment[]) {
  const runSegments = filter(({ color }) => isRunColor(color), segments)
  return uniqWith(isEqual, flatMap(toShaft, runSegments))
}

function isRunColor(color: string) {
  const red = Number.parseInt(color.slice(1, 3), HEX_RADIX)
  const blue = Number.parseInt(color.slice(5, 7), HEX_RADIX)
  return red <= MAX_RUN_RED && blue >= MIN_RUN_BLUE
}

function toShaft({ from, to }: DrawingSegment): Shaft[] {
  const length = distanceBetween(from, to)
  if (length < MIN_SHAFT_LENGTH_PT) return []

  const direction = {
    x: (to.x - from.x) / length,
    y: (to.y - from.y) / length,
  }
  const first = projectOnto(from, direction)
  const second = projectOnto(to, direction)

  return [
    {
      angle: Math.atan2(direction.y, direction.x) / RADIANS_PER_DEGREE,
      direction,
      end: Math.max(first, second),
      offset: projectOnto(from, normalOf(direction)),
      start: Math.min(first, second),
    },
  ]
}

function isParallel(angle: number, otherAngle: number) {
  const difference =
    (((angle - otherAngle) % HALF_TURN_DEGREES) + HALF_TURN_DEGREES) %
    HALF_TURN_DEGREES
  return (
    Math.min(difference, HALF_TURN_DEGREES - difference) <=
    PARALLEL_TOLERANCE_DEGREES
  )
}

function findNumberedShafts(
  texts: DrawingText[],
  shafts: Shaft[],
): NumberedShaft[] {
  return uniqBy(
    "shaft",
    flatMap((text) => {
      const match = RUN_NUMBER.exec(text.text)
      const shaft = match && nearestShaft(text, shafts, MAX_NUMBER_DISTANCE_PT)
      return match && shaft
        ? [{ number: Number(match[1]), numberText: text, shaft }]
        : []
    }, texts),
  )
}

function findUnitLabels(texts: DrawingText[]): UnitLabel[] {
  return flatMap((text) => {
    const dimensions = UNIT_DIMENSIONS.exec(text.text)
    if (!dimensions) return []

    const otherLines = findOtherLabelLines(text, texts)
    const [onlyLine] = otherLines
    const shelves =
      otherLines.length === 1 && onlyLine && UNIT_SHELVES.exec(onlyLine.text)

    return [
      {
        angle: text.angle,
        depth: Number(dimensions[2]),
        height: Number(dimensions[3]),
        position: { x: text.x, y: text.y },
        shelves: shelves
          ? [{ depth: Number(shelves[2]), numberOfShelves: Number(shelves[1]) }]
          : [],
        textHeight: text.height,
        width: Number(dimensions[1]),
      },
    ]
  }, texts)
}

function findImpulseLabels(texts: DrawingText[]): ImpulseLabel[] {
  return flatMap((text) => {
    const unit = IMPULSE_UNIT.exec(text.text)
    if (!unit) return []

    const heightNote =
      unit[1] ??
      findOtherLabelLines(text, texts)
        .map((line) => IMPULSE_HEIGHT_NOTE.exec(line.text)?.[1])
        .find(Boolean)
    const height = IMPULSE_HEIGHTS.find(
      (impulseHeight) => impulseHeight === Number(heightNote),
    )
    if (heightNote && !height) return []

    return [
      {
        angle: text.angle,
        depth: Number(unit[3]),
        height,
        position: { x: text.x, y: text.y },
        shelves: unit[4]
          ? [{ depth: Number(unit[5]), numberOfShelves: Number(unit[4]) }]
          : [],
        textHeight: text.height,
        width: Number(unit[2]),
      },
    ]
  }, texts)
}

function findOtherLabelLines(label: DrawingText, texts: DrawingText[]) {
  const reach = label.height * LABEL_REACH_IN_TEXT_HEIGHTS
  return filter(
    (other: DrawingText) =>
      other !== label &&
      other.angle === label.angle &&
      Math.abs(other.height - label.height) <=
        label.height * TEXT_HEIGHT_TOLERANCE &&
      distanceBetween(label, other) <= reach,
    texts,
  )
}

function labelSideOf(shaft: Shaft, labels: PlacedLabel[]) {
  const inReach = filter(
    (label: PlacedLabel) =>
      isParallel(label.angle, shaft.angle) &&
      distanceToShaft(label.position, shaft) <= labelReach(label),
    labels,
  )
  const nearest = minBy(
    ({ position }) => distanceToShaft(position, shaft),
    inReach,
  )
  return nearest ? Math.sign(offsetFromShaft(nearest.position, shaft)) : 0
}

function findShaftOfLabel(label: PlacedLabel, sidedShafts: SidedShaft[]) {
  const shaftsFacingLabel = filter(
    ({ shaft, side }: SidedShaft) =>
      isParallel(shaft.angle, label.angle) &&
      Math.sign(offsetFromShaft(label.position, shaft)) === side,
    sidedShafts,
  )
  return nearestShaft(
    label.position,
    map("shaft", shaftsFacingLabel),
    labelReach(label),
  )
}

function labelReach({ textHeight }: PlacedLabel) {
  return textHeight * LABEL_DISTANCE_IN_TEXT_HEIGHTS
}

function nearestShaft(point: Point, shafts: Shaft[], maxDistance: number) {
  const inReach = filter(
    (shaft) => distanceToShaft(point, shaft) <= maxDistance,
    shafts,
  )
  return minBy((shaft) => distanceToShaft(point, shaft), inReach)
}

function splitIntoRows(shaft: Shaft, labels: UnitLabel[]) {
  const rows: UnitLabel[][] = []
  let rowDistance = -Infinity

  for (const label of sortBy(
    ({ position }) => distanceToShaft(position, shaft),
    labels,
  )) {
    const distance = distanceToShaft(label.position, shaft)
    const row = rows.at(-1)
    if (
      row &&
      distance - rowDistance < label.textHeight * ROW_TOLERANCE_IN_TEXT_HEIGHTS
    ) {
      row.push(label)
    } else {
      rows.push([label])
      rowDistance = distance
    }
  }

  return rows
}

function alongShaft(point: Point, shaft: Shaft) {
  return projectOnto(point, shaft.direction)
}

function distanceToShaft(point: Point, shaft: Shaft) {
  const along = alongShaft(point, shaft)
  if (along < shaft.start || along > shaft.end) return Infinity
  return Math.abs(offsetFromShaft(point, shaft))
}

function offsetFromShaft(point: Point, shaft: Shaft) {
  return projectOnto(point, normalOf(shaft.direction)) - shaft.offset
}

function projectOnto({ x, y }: Point, direction: Point) {
  return x * direction.x + y * direction.y
}

function normalOf({ x, y }: Point): Point {
  return { x: -y, y: x }
}

function distanceBetween(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function toLayoutWall(
  { depth, height }: UnitLabel,
  units: UnitLabel[],
): LayoutWall {
  return {
    backVariant: DEFAULT_BACK_VARIANT,
    depth,
    hasBaseCover: true,
    height,
    numberOfLayouts: LAYOUTS_PER_RUN,
    shelfUnits: toShelfUnits(units),
  }
}

function toLayoutGondola(
  nearRow: UnitLabel[],
  farRow: UnitLabel[],
  { left, right }: EndCaps,
): LayoutGondola | undefined {
  const nearSide = toGondolaSide(nearRow)
  const farSide = toGondolaSide(farRow)
  const [first] = nearRow
  if (!first || !nearSide || !farSide) return undefined

  const allUnits = [...nearRow, ...farRow, ...left, ...right]
  if (!every({ height: first.height }, allUnits)) return undefined

  return {
    height: first.height,
    leftEndCap: toGondolaSide(left),
    numberOfLayouts: LAYOUTS_PER_RUN,
    rightEndCap: toGondolaSide(right),
    sides: [farSide, nearSide],
  }
}

function toGondolaSide(units: UnitLabel[]): GondolaSide | undefined {
  const [first] = units
  if (!first || !every({ depth: first.depth }, units)) return undefined

  return {
    backVariant: DEFAULT_BACK_VARIANT,
    depth: first.depth,
    hasBaseCover: true,
    shelfUnits: toShelfUnits(units),
  }
}

function toShelfUnits(units: UnitLabel[]) {
  const unitKey = ({ shelves, width }: UnitLabel) =>
    `${width}/${JSON.stringify(shelves)}`
  const unitCounts = countBy(unitKey, units)

  return map(
    (unit: UnitLabel) => ({
      numberOfShelfUnits: unitCounts[unitKey(unit)] ?? 0,
      shelves: unit.shelves,
      width: unit.width,
    }),
    uniqBy(unitKey, units),
  )
}
