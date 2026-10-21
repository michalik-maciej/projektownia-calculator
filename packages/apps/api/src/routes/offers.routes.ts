import type { Router as ExpressRouter } from "express"
import { Router } from "express"

import { withAuth } from "./withAuth"
import {
  OfferControllerDependencies,
  offerControllers,
} from "../controllers/offer/offerControllers"

export function createOffersRouter(
  dependencies: OfferControllerDependencies,
): ExpressRouter {
  const router: ExpressRouter = Router()
  const guarded = withAuth(router)
  const offer = offerControllers(dependencies)

  guarded.get("/", offer.list)
  guarded.get("/:id", offer.details)
  guarded.post("/", offer.create)
  guarded.put("/:id", offer.update)
  guarded.delete("/:id", offer.remove)

  return router
}
