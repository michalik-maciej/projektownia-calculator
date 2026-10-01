import cookieParser from "cookie-parser"
import cors from "cors"
import type { Express } from "express"
import express from "express"
import helmet from "helmet"

import { InventorySource } from "./controllers/offer/calculateOffer.controller"
import { getAllComponents } from "./db/inventory.repository"
import { OfferStore, offerStore } from "./db/offer.repository"
import { UserStore, userStore } from "./db/user.repository"
import { createAuthRouter } from "./routes/auth.routes"
import healthRoutes from "./routes/health.routes"
import { createInventoryRouter } from "./routes/inventory.routes"
import { createOffersRouter } from "./routes/offers.routes"
import { createUsersRouter } from "./routes/users.routes"

type AppDependencies = {
  getInventory: InventorySource
  offers: OfferStore
  users: UserStore
}

/**
 * Builds the Express application with its middleware and routes.
 *
 * This is the composition root: the only place that decides where the offer
 * routes read the component inventory and the saved offers from.
 *
 * @param getInventory - Source of the component catalogue. Defaults to the
 * database repository; tests pass a fixture so the offer endpoint can be
 * exercised without a database.
 * @param offers - Persistence for saved offers. Defaults to the Prisma
 * repository; tests pass an in-memory store.
 */
export function createApp({
  getInventory = getAllComponents,
  offers = offerStore,
  users = userStore,
}: Partial<AppDependencies> = {}): Express {
  const app: Express = express()

  app.set("trust proxy", 1)

  app.use(helmet())
  app.use(express.json())
  app.use(cookieParser())
  app.use(cors({ credentials: true, origin: process.env.WEBAPP_DOMAIN }))

  app.use("/api/health", healthRoutes)
  app.use("/api/auth", createAuthRouter({ getInventory, offers, users }))
  app.use("/api/inventory", createInventoryRouter({ getInventory }))
  app.use("/api/offers", createOffersRouter({ getInventory, offers }))
  app.use("/api/users", createUsersRouter({ users }))

  return app
}
