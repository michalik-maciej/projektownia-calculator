import type { Router as ExpressRouter } from "express"
import { Router } from "express"

import { withAuth } from "./withAuth"
import { requireAdmin } from "../controllers/auth/requireAdmin"
import { createComponentController } from "../controllers/inventory/createComponent.controller"
import { deleteComponentController } from "../controllers/inventory/deleteComponent.controller"
import { getComponentsController } from "../controllers/inventory/getComponents.controller"
import { updateComponentController } from "../controllers/inventory/updateComponent.controller"
import { InventorySource } from "../db/inventory.repository"

export function createInventoryRouter({
  getInventory,
}: {
  getInventory: InventorySource
}): ExpressRouter {
  const router: ExpressRouter = Router()
  const guarded = withAuth(router)

  guarded.get("/items", getComponentsController({ getInventory }))
  guarded.post("/items", requireAdmin, createComponentController)
  guarded.put("/items/:id", requireAdmin, updateComponentController)
  guarded.delete("/items/:id", requireAdmin, deleteComponentController)

  return router
}
