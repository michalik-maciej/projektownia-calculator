import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import { createDefaultOfferInput } from "../helpers/createDefaultOfferInput"
import { offerApi, offerQueries } from "../offer.api"

export function useCreateOffer() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => offerApi.create({ data: createDefaultOfferInput() }),
    onSuccess: (offer) => {
      queryClient.setQueryData(offerQueries.details(offer.id).queryKey, offer)
      queryClient.invalidateQueries({ queryKey: ["offer", "list"] })
      navigate({ search: { offerId: offer.id }, to: "." })
    },
    onError: (error) => {
      console.error("Creating the offer failed:", error)
      toast.error("Nie udało się utworzyć oferty.", { position: "top-center" })
    },
  })
}
