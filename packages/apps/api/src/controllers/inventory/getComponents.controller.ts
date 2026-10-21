import { Request, Response } from "express"

import { InventorySource } from "../../db/inventory.repository"

export function getComponentsController({
  getInventory,
}: {
  getInventory: InventorySource
}) {
  return async (_req: Request, res: Response) => {
    try {
      const components = await getInventory()

      return res.status(200).json(components)
    } catch (error) {
      console.error("Reading the catalogue failed:", error)
      return res.status(500).json({ error: "Reading the catalogue failed" })
    }
  }
}
