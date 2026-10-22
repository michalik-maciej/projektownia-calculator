import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import { useOffer } from "./useOffer"
import { offerApi } from "../offer.api"

export function useDeleteOffer() {
  const { offerId } = useOffer()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => offerApi.delete({ params: { id } }),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: ["offer", "details", id] })
      queryClient.invalidateQueries({ queryKey: ["offer", "list"] })
      if (id === offerId) {
        navigate({ search: {}, to: "." })
      }
      toast.success("Oferta usunięta.", { position: "top-center" })
    },
    onError: (error) => {
      console.error("Deleting the offer failed:", error)
      toast.error("Nie udało się usunąć oferty.", { position: "top-center" })
    },
  })
}
