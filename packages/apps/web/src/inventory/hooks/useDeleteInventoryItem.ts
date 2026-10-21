import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { inventoryApi, inventoryQueries } from "../inventory.api"

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => inventoryApi.delete({ params: { id } }),
    onSuccess: async () => {
      toast.success("Element został usunięty.", {
        position: "top-center",
      })
      await queryClient.invalidateQueries({
        queryKey: inventoryQueries.list().queryKey,
      })
      await queryClient.invalidateQueries({ queryKey: ["offer", "details"] })
    },
  })
}
