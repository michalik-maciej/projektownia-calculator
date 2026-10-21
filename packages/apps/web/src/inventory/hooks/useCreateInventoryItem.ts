import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { InventoryItemCreateInput } from "../inventory.api"
import { inventoryApi, inventoryQueries } from "../inventory.api"

export function useCreateInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: InventoryItemCreateInput) =>
      inventoryApi.create({ data }),
    onSuccess: async () => {
      toast.success("Element został utworzony.", { position: "top-center" })
      await queryClient.invalidateQueries({
        queryKey: inventoryQueries.list().queryKey,
      })
      await queryClient.invalidateQueries({ queryKey: ["offer", "details"] })
    },
  })
}
