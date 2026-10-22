import { Request, Response } from "express"
import * as v from "valibot"

import { IdParamSchema } from "@/schemas/IdParam.schema"
import { OfferUpdateSchema } from "@/schemas/Offer.schema"

import { priceOffer } from "./priceOffer"
import { toOfferScope } from "./toOfferScope"
import { InventorySource } from "../../db/inventory.repository"
import { OfferStore } from "../../db/offer.repository"

export function updateOfferController({
  getInventory,
  getOfferById,
  updateOffer,
}: Pick<OfferStore, "getOfferById" | "updateOffer"> & {
  getInventory: InventorySource
}) {
  return async (req: Request, res: Response) => {
    const params = v.safeParse(IdParamSchema, req.params)

    if (!params.success) {
      return res.status(400).json({ error: "Invalid request" })
    }

    const parsed = v.safeParse(OfferUpdateSchema, req.body)

    if (parsed.issues) {
      return res.status(400).json({
        error: "Invalid input",
        issues: v.flatten(parsed.issues),
      })
    }

    const scope = toOfferScope(req.user)

    if (!scope) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const existing = await getOfferById(params.output.id, scope)
    if (!existing) {
      return res.status(404).json({ error: "Offer not found" })
    }

    const { expectedUpdatedAt, ...input } = parsed.output

    try {
      const inventory = await getInventory()
      const updated = await updateOffer({
        expectedUpdatedAt: new Date(expectedUpdatedAt),
        id: params.output.id,
        title: input.title,
        discountPercentage: input.discountPercentage,
        input,
      })

      if (!updated) {
        return res
          .status(409)
          .json({ error: "Offer was changed by somebody else" })
      }

      return res
        .status(200)
        .json({ ...updated, ...priceOffer(input, inventory) })
    } catch (error) {
      console.error("Offer update failed:", error)
      return res.status(500).json({ error: "Offer update failed" })
    }
  }
}
