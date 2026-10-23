import * as v from "valibot"

import { LayoutGondolaValue } from "./LayoutGondola.schema"
import { LayoutWallValue } from "./LayoutWall.schema"

export const PdfImportOutputSchema = v.object({
  layouts: v.array(v.union([LayoutGondolaValue, LayoutWallValue])),
})

export type PdfImportOutput = v.InferOutput<typeof PdfImportOutputSchema>
