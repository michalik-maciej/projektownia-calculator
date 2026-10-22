import { RequestHandler } from "express"

import { createOfferController } from "./createOffer.controller"
import { deleteOfferController } from "./deleteOffer.controller"
import { getOfferController } from "./getOffer.controller"
import { getOffersController } from "./getOffers.controller"
import { getOfferSharesController } from "./getOfferShares.controller"
import { setOfferSharesController } from "./setOfferShares.controller"
import { updateOfferController } from "./updateOffer.controller"
import { InventorySource } from "../../db/inventory.repository"
import { OfferStore } from "../../db/offer.repository"

export type OfferControllerDependencies = {
  getInventory: InventorySource
  offers: OfferStore
}

export function offerControllers({
  getInventory,
  offers,
}: OfferControllerDependencies): Record<
  "create" | "details" | "list" | "remove" | "share" | "shares" | "update",
  RequestHandler
> {
  return {
    create: createOfferController({ ...offers, getInventory }),
    details: getOfferController({ ...offers, getInventory }),
    list: getOffersController(offers),
    remove: deleteOfferController(offers),
    share: setOfferSharesController(offers),
    shares: getOfferSharesController(offers),
    update: updateOfferController({ ...offers, getInventory }),
  }
}
