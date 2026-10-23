import { Request, Response } from "express"

import { PdfImportOutput } from "@/schemas/PdfImport.schema"

import { findRuns } from "../../pdfImport/findRuns"
import { readDrawing } from "../../pdfImport/readDrawing"

const PDF_SIGNATURE = "%PDF-"

export function createPdfImportController() {
  return async (req: Request, res: Response) => {
    if (!isPdf(req.body)) {
      return res.status(400).json({ error: "Expected a PDF file" })
    }

    try {
      const runs = findRuns(await readDrawing(new Uint8Array(req.body)))
      const output: PdfImportOutput = {
        layouts: runs.map(({ layout, number }) => ({
          ...layout,
          drawingRunNumber: number,
          isExcludedFromOffer: true,
        })),
      }

      return res.status(200).json(output)
    } catch (error) {
      console.error("PDF import failed:", error)
      return res.status(400).json({ error: "Unreadable PDF" })
    }
  }
}

function isPdf(body: unknown): body is Buffer {
  return (
    Buffer.isBuffer(body) &&
    body.subarray(0, PDF_SIGNATURE.length).toString("latin1") === PDF_SIGNATURE
  )
}
