import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { InventoryItemUpdateInput } from "../inventory.api"
import { inventoryApi, inventoryQueries } from "../inventory.api"

type UpdateInput = {
  id: string
  data: Partial<InventoryItemUpdateInput>
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: UpdateInput) =>
      inventoryApi.update({ params: { id }, data }),
    onSuccess: async () => {
      toast.success("Element został zaktualizowany.", {
        position: "top-center",
      })
      await queryClient.invalidateQueries({
        queryKey: inventoryQueries.list().queryKey,
      })
      await queryClient.invalidateQueries({ queryKey: ["offer", "details"] })
    },
  })
}
