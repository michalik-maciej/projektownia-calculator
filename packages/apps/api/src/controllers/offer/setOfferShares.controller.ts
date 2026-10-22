import { Request, Response } from "express"
import * as v from "valibot"

import { IdParamSchema } from "@/schemas/IdParam.schema"
import { OfferSharesSchema } from "@/schemas/Offer.schema"

import { toOfferScope } from "./toOfferScope"
import { OfferStore } from "../../db/offer.repository"

export function setOfferSharesController({
  getOfferById,
  setOfferShares,
}: Pick<OfferStore, "getOfferById" | "setOfferShares">) {
  return async (req: Request, res: Response) => {
    const params = v.safeParse(IdParamSchema, req.params)

    if (!params.success) {
      return res.status(400).json({ error: "Invalid request" })
    }

    const parsed = v.safeParse(OfferSharesSchema, req.body)

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
      const existing = await getOfferById(params.output.id, scope)
      if (!existing) {
        return res.status(404).json({ error: "Offer not found" })
      }

      const shared = await setOfferShares(
        params.output.id,
        parsed.output.userIds,
      )

      if (!shared) {
        return res
          .status(400)
          .json({ error: "Offers can only be shared with user accounts" })
      }

      return res.status(200).json(parsed.output)
    } catch (error) {
      console.error("Sharing the offer failed:", error)
      return res.status(500).json({ error: "Sharing the offer failed" })
    }
  }
}
