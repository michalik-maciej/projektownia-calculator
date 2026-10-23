export type Point = { x: number; y: number }

export type DrawingText = {
  angle: number
  height: number
  text: string
  x: number
  y: number
}

export type DrawingSegment = { color: string; from: Point; to: Point }

export type Drawing = { segments: DrawingSegment[]; texts: DrawingText[] }

type Matrix = [number, number, number, number, number, number]

type GraphicsState = { color: string; matrix: Matrix }

const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0]

// DrawOPS codes inside a constructPath argument; pdfjs-dist does not export them.
const DRAW_MOVE_TO = 0
const DRAW_LINE_TO = 1
const DRAW_CURVE_TO = 2
const DRAW_QUADRATIC_CURVE_TO = 3

const POINT_COORDINATES = 2
const CURVE_COORDINATES = 6
const QUADRATIC_CURVE_COORDINATES = 4

const DEGREES_PER_RADIAN = 180 / Math.PI

export async function readDrawing(data: Uint8Array): Promise<Drawing> {
  const { OPS, VerbosityLevel, getDocument } =
    await import("pdfjs-dist/legacy/build/pdf.mjs")
  const loadingTask = getDocument({ data, verbosity: VerbosityLevel.ERRORS })
  try {
    const pdf = await loadingTask.promise
    const page = await pdf.getPage(1)

    const { items } = await page.getTextContent()
    const texts = items.flatMap((item) =>
      "str" in item && item.str.trim() ? [readText(item)] : [],
    )

    const { argsArray, fnArray } = await page.getOperatorList()
    const segments: DrawingSegment[] = []
    const stack: GraphicsState[] = []
    let state: GraphicsState = { color: "", matrix: IDENTITY }

    fnArray.forEach((operation, index) => {
      const args = argsArray[index]

      if (operation === OPS.save) stack.push(state)
      if (operation === OPS.restore) state = stack.pop() ?? state
      if (operation === OPS.transform) {
        state = { ...state, matrix: multiply(args, state.matrix) }
      }
      if (operation === OPS.setStrokeRGBColor) {
        state = { ...state, color: String(args[0]) }
      }
      if (operation === OPS.constructPath) {
        for (const path of args[1]) {
          if (path) segments.push(...readSegments(path, state))
        }
      }
    })

    return { segments, texts }
  } finally {
    await loadingTask.destroy()
  }
}

function readText({
  height,
  str,
  transform,
}: {
  height: number
  str: string
  transform: number[]
}): DrawingText {
  const [a = 1, b = 0, , , x = 0, y = 0] = transform
  const angle = Math.round(Math.atan2(b, a) * DEGREES_PER_RADIAN)

  return { angle, height, text: str.trim(), x, y }
}

function readSegments(
  path: ArrayLike<number>,
  { color, matrix }: GraphicsState,
) {
  const segments: DrawingSegment[] = []
  const pointAt = (index: number) =>
    apply(matrix, { x: path[index] ?? 0, y: path[index + 1] ?? 0 })
  let current: Point | undefined
  let index = 0

  while (index < path.length) {
    const code = path[index]
    index += 1

    if (code === DRAW_MOVE_TO) {
      current = pointAt(index)
      index += POINT_COORDINATES
    } else if (code === DRAW_LINE_TO) {
      const next = pointAt(index)
      if (current) segments.push({ color, from: current, to: next })
      current = next
      index += POINT_COORDINATES
    } else if (code === DRAW_CURVE_TO) {
      current = pointAt(index + CURVE_COORDINATES - POINT_COORDINATES)
      index += CURVE_COORDINATES
    } else if (code === DRAW_QUADRATIC_CURVE_TO) {
      current = pointAt(index + QUADRATIC_CURVE_COORDINATES - POINT_COORDINATES)
      index += QUADRATIC_CURVE_COORDINATES
    }
  }

  return segments
}

function multiply(
  [a1, b1, c1, d1, e1, f1]: Matrix,
  [a2, b2, c2, d2, e2, f2]: Matrix,
): Matrix {
  return [
    a1 * a2 + b1 * c2,
    a1 * b2 + b1 * d2,
    c1 * a2 + d1 * c2,
    c1 * b2 + d1 * d2,
    e1 * a2 + f1 * c2 + e2,
    e1 * b2 + f1 * d2 + f2,
  ]
}

function apply([a, b, c, d, e, f]: Matrix, { x, y }: Point): Point {
  return { x: a * x + c * y + e, y: b * x + d * y + f }
}
