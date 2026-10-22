import { Request, Response } from "express"
import * as v from "valibot"

import { OfferInputSchema } from "@/schemas/Offer.schema"

import { priceOffer } from "./priceOffer"
import { toOfferScope } from "./toOfferScope"
import { InventorySource } from "../../db/inventory.repository"
import { OfferStore } from "../../db/offer.repository"

export function createOfferController({
  createOffer,
  getInventory,
}: Pick<OfferStore, "createOffer"> & { getInventory: InventorySource }) {
  return async (req: Request, res: Response) => {
    const parsed = v.safeParse(OfferInputSchema, req.body)

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid input",
        issues: v.flatten(parsed.issues),
      })
    }

    const scope = toOfferScope(req.user)

    if (!scope) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    try {
      const inventory = await getInventory()
      const offer = await createOffer({
        title: parsed.output.title,
        discountPercentage: parsed.output.discountPercentage,
        input: parsed.output,
        userId: scope.userId,
      })

      return res
        .status(201)
        .json({ ...offer, ...priceOffer(parsed.output, inventory) })
    } catch (error) {
      console.error("Offer creation failed:", error)
      return res.status(500).json({ error: "Offer creation failed" })
    }
  }
}
