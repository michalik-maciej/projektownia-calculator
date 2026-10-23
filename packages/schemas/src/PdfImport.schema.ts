import * as v from "valibot"

import { LayoutGondolaValue } from "./LayoutGondola.schema"
import { LayoutImpulseValue } from "./LayoutImpulse.schema"
import { LayoutWallValue } from "./LayoutWall.schema"

export const PdfImportOutputSchema = v.object({
  layouts: v.array(
    v.union([LayoutGondolaValue, LayoutWallValue, LayoutImpulseValue]),
  ),
})

export type PdfImportOutput = v.InferOutput<typeof PdfImportOutputSchema>
