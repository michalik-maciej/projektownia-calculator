import { Request, Response } from "express"
import * as v from "valibot"

import { IdParamSchema } from "@/schemas/IdParam.schema"

import { toOfferScope } from "./toOfferScope"
import { OfferStore } from "../../db/offer.repository"

export function getOfferSharesController({
  getOfferById,
  getOfferShares,
}: Pick<OfferStore, "getOfferById" | "getOfferShares">) {
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

      const userIds = await getOfferShares(params.output.id)
      return res.status(200).json({ userIds })
    } catch (error) {
      console.error("Reading the offer shares failed:", error)
      return res.status(500).json({ error: "Reading the offer shares failed" })
    }
  }
}
