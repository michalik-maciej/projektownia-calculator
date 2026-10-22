import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { offerApi, offerQueries } from "../offer.api"

export function useSetOfferShares(offerId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userIds: string[]) =>
      offerApi.setShares({ params: { id: offerId }, data: { userIds } }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: offerQueries.shares(offerId).queryKey,
      })
      toast.success("Udostępnienie zapisane.", { position: "top-center" })
    },
    onError: (error) => {
      console.error("Sharing the offer failed:", error)
      toast.error("Nie udało się udostępnić oferty.", {
        position: "top-center",
      })
    },
  })
}
