import { Request, Response } from "express"
import * as v from "valibot"

import { CreateComponentSchema } from "@/schemas/inventory/ComponentCreate.schema"

import { ComponentStore } from "../../db/inventory.repository"

export function createComponentController({
  createComponent,
}: Pick<ComponentStore, "createComponent">) {
  return async (req: Request, res: Response) => {
    const parsed = v.safeParse(CreateComponentSchema, req.body)

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid component payload",
        issues: v.flatten(parsed.issues),
      })
    }

    try {
      const component = await createComponent(parsed.output)

      return res.status(201).json(component)
    } catch (error) {
      console.error("Component creation failed:", error)
      return res.status(500).json({ error: "Component creation failed" })
    }
  }
}
