import type { Router as ExpressRouter } from "express"
import express, { Router } from "express"

import { withAuth } from "./withAuth"
import { requireNonDemo } from "../controllers/auth/requireNonDemo"
import { createPdfImportController } from "../controllers/pdfImport/createPdfImport.controller"

const MAX_PDF_SIZE = "5mb"

export function createPdfImportsRouter(): ExpressRouter {
  const router: ExpressRouter = Router()
  const guarded = withAuth(router)

  guarded.post(
    "/",
    requireNonDemo,
    express.raw({ limit: MAX_PDF_SIZE, type: "application/pdf" }),
    createPdfImportController(),
  )

  return router
}
