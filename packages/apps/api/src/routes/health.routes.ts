import type { Router as ExpressRouter } from "express"
import { Router } from "express"

import { getVersionInfo } from "../version"

const router: ExpressRouter = Router()

router.get("/", (_req, res) => {
  res.status(200).json({ status: "ok", ...getVersionInfo() })
})

export default router
