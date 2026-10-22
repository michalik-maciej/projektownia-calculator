import { RefObject } from "react"
import { UseFormReset } from "react-hook-form"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { OfferInput, SavedOffer } from "@/schemas/Offer.schema"

import { isConflict, isUnauthorized } from "../../core/createMethod.api"
import { offerApi, offerMutationKeys, offerQueries } from "../offer.api"

const AUTOSAVE_RETRIES = 2

export type HydratedOffer = Pick<SavedOffer, "id" | "updatedAt">

export function useAutoSaveOffer({
  hydratedRef,
  offerId,
  reset,
}: {
  hydratedRef: RefObject<HydratedOffer | null>
  offerId: string | undefined
  reset: UseFormReset<OfferInput>
}) {
  const queryClient = useQueryClient()

  const hydrate = ({ id, updatedAt }: SavedOffer) => {
    hydratedRef.current = { id, updatedAt }
  }

  return useMutation({
    mutationKey: offerMutationKeys.autoSave,
    mutationFn: (values: OfferInput) =>
      offerApi.update({
        data: {
          ...values,
          expectedUpdatedAt: hydratedRef.current?.updatedAt ?? "",
        },
        params: { id: offerId ?? "" },
      }),
    retry: (failureCount, error) =>
      !isUnauthorized(error) &&
      !isConflict(error) &&
      failureCount < AUTOSAVE_RETRIES,
    onSuccess: (saved: SavedOffer, sentValues: OfferInput) => {
      hydrate(saved)
      queryClient.setQueryData(offerQueries.details(saved.id).queryKey, saved)
      reset(sentValues, { keepValues: true })
    },
    onError: async (error) => {
      if (isConflict(error) && offerId) {
        const latest = await queryClient.fetchQuery(
          offerQueries.details(offerId),
        )
        hydrate(latest)
        reset(latest.input)
        toast.warning(
          "Ktoś inny zmienił w międzyczasie tę ofertę. Wczytano aktualną wersję, Twoje ostatnie zmiany nie zostały zapisane.",
          { position: "top-center" },
        )
        return
      }

      console.error("Autosaving the offer failed:", error)
      toast.error("Nie udało się zapisać zmian.", { position: "top-center" })
    },
  })
}
