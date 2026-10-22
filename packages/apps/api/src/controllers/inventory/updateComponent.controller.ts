import { Request, Response } from "express"
import * as v from "valibot"

import { IdParamSchema } from "@/schemas/IdParam.schema"
import { UpdateComponentSchema } from "@/schemas/inventory/ComponentUpdate.schema"

import { ComponentStore } from "../../db/inventory.repository"

export function updateComponentController({
  updateComponent,
}: Pick<ComponentStore, "updateComponent">) {
  return async (req: Request, res: Response) => {
    const body = v.safeParse(UpdateComponentSchema, req.body)
    const params = v.safeParse(IdParamSchema, req.params)

    if (!body.success || !params.success) {
      return res.status(400).json({ error: "Invalid request" })
    }

    try {
      const updated = await updateComponent({
        ...body.output,
        id: params.output.id,
      })

      return res.status(200).json(updated)
    } catch (error) {
      console.error("Component update failed:", error)
      return res.status(500).json({ error: "Component update failed" })
    }
  }
}
