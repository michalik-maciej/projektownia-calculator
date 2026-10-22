import { Request, Response } from "express"
import * as v from "valibot"

import { IdParamSchema } from "@/schemas/IdParam.schema"

import { toOfferScope } from "./toOfferScope"
import { OfferStore } from "../../db/offer.repository"

export function deleteOfferController({
  deleteOffer,
  getOfferById,
}: Pick<OfferStore, "deleteOffer" | "getOfferById">) {
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
      const existing = await getOfferById(params.output.id, scope)
      if (!existing) {
        return res.status(404).json({ error: "Offer not found" })
      }

      await deleteOffer(params.output.id)
      return res.sendStatus(204)
    } catch (error) {
      console.error("Offer deletion failed:", error)
      return res.status(500).json({ error: "Offer deletion failed" })
    }
  }
}
