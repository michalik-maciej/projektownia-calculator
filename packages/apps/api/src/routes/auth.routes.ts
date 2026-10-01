import type { Router as ExpressRouter } from "express"
import { Router } from "express"
import { get } from "lodash/fp"

import { createLoginRateLimit } from "./loginRateLimit"
import { withAuth } from "./withAuth"
import { demoLoginController } from "../controllers/auth/demoLogin.controller"
import { loginController } from "../controllers/auth/login.controller"
import { logoutController } from "../controllers/auth/logout.controller"
import { registerController } from "../controllers/auth/register.controller"
import { requireAdmin } from "../controllers/auth/requireAdmin"
import { InventorySource } from "../controllers/offer/calculateOffer.controller"
import { OfferStore } from "../db/offer.repository"
import { UserStore } from "../db/user.repository"

export function createAuthRouter({
  getInventory,
  offers,
  users,
}: {
  getInventory: InventorySource
  offers: Pick<OfferStore, "createOffer">
  users: UserStore
}): ExpressRouter {
  const router: ExpressRouter = Router()
  const guarded = withAuth(router)

  guarded.get("/user", (req, res) => {
    res.json({ user: get("user", req) })
  })
  router.post("/login", createLoginRateLimit(), loginController)
  router.post(
    "/demo",
    demoLoginController({ ...users, ...offers, getInventory }),
  )
  guarded.post("/logout", logoutController)
  guarded.post("/register", requireAdmin, registerController)

  return router
}
