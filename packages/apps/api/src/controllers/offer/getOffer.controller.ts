import { Request, Response } from "express"
import * as v from "valibot"

import { IdParamSchema } from "@/schemas/IdParam.schema"
import { OfferInputSchema } from "@/schemas/Offer.schema"

import { priceOffer } from "./priceOffer"
import { toOfferScope } from "./toOfferScope"
import { InventorySource } from "../../db/inventory.repository"
import { OfferStore } from "../../db/offer.repository"

export function getOfferController({
  getInventory,
  getOfferById,
}: Pick<OfferStore, "getOfferById"> & { getInventory: InventorySource }) {
  return async (req: Request, res: Response) => {
    const params = v.safeParse(IdParamSchema, req.params)

    if (!params.success) {
      return res.status(400).json({ error: "Invalid request" })
    }

    const scope = toOfferScope(req.user)

    if (!scope) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    try {
      const offer = await getOfferById(params.output.id, scope)

      if (!offer) {
        return res.status(404).json({ error: "Offer not found" })
      }

      const input = v.parse(OfferInputSchema, offer.input)
      const inventory = await getInventory()
      return res.status(200).json({ ...offer, ...priceOffer(input, inventory) })
    } catch (error) {
      console.error("Reading the offer failed:", error)
      return res.status(500).json({ error: "Reading the offer failed" })
    }
  }
}
