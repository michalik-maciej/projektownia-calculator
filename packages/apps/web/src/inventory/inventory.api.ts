import * as v from "valibot"

import { ComponentBaseSchema } from "@/schemas/inventory/Component.schema"
import { CreateComponentSchema } from "@/schemas/inventory/ComponentCreate.schema"
import { UpdateComponentSchema } from "@/schemas/inventory/ComponentUpdate.schema"

import { apiType, createApiMethod } from "../core/createMethod.api"

const InventoryItemSchema = v.object({
  id: v.string(),
  ...ComponentBaseSchema.entries,
})

export type InventoryItem = v.InferOutput<typeof InventoryItemSchema>
export type InventoryItemCreateInput = v.InferOutput<
  typeof CreateComponentSchema
>
export type InventoryItemUpdateInput = v.InferOutput<
  typeof UpdateComponentSchema
>

const InventoryItemListSchema = v.array(InventoryItemSchema)

const apiUrl = import.meta.env.VITE_API_URL
if (!apiUrl) {
  throw new Error("Missing VITE_API_URL")
}

export const inventoryApi = {
  list: createApiMethod({
    method: "GET",
    path: `${apiUrl}/inventory/items`,
    response: InventoryItemListSchema,
  }),

  create: createApiMethod({
    method: "POST",
    path: `${apiUrl}/inventory/items`,
    response: InventoryItemSchema,
    data: apiType<InventoryItemCreateInput>(),
  }),

  update: createApiMethod({
    method: "PUT",
    path: `${`${apiUrl}/inventory/items`}/:id`,
    response: InventoryItemSchema,
    data: apiType<InventoryItemUpdateInput>(),
  }),

  delete: createApiMethod({
    method: "DELETE",
    path: `${`${apiUrl}/inventory/items`}/:id`,
  }),
}

export const inventoryQueries = {
  list: () => ({
    queryKey: ["inventory", "list"] as const,
    queryFn: () => inventoryApi.list(),
  }),
}
