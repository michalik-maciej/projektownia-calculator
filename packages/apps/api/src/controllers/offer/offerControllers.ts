import { RequestHandler } from "express"

import {
  calculateOfferController,
  InventorySource,
} from "./calculateOffer.controller"
import { createOfferController } from "./createOffer.controller"
import { deleteOfferController } from "./deleteOffer.controller"
import { getOfferController } from "./getOffer.controller"
import { getOffersController } from "./getOffers.controller"
import { updateOfferController } from "./updateOffer.controller"
import { OfferStore } from "../../db/offer.repository"

export type OfferControllerDependencies = {
  getInventory: InventorySource
  offers: OfferStore
}

export function offerControllers({
  getInventory,
  offers,
}: OfferControllerDependencies): Record<
  "create" | "details" | "list" | "preview" | "remove" | "update",
  RequestHandler
> {
  return {
    create: createOfferController({ ...offers, getInventory }),
    details: getOfferController({ ...offers, getInventory }),
    list: getOffersController(offers),
    preview: calculateOfferController({ getInventory }),
    remove: deleteOfferController(offers),
    update: updateOfferController({ ...offers, getInventory }),
  }
}
