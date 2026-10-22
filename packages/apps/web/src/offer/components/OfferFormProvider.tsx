import { ReactNode, useEffect, useRef, useState } from "react"
import { FormProvider, useForm, useFormState, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { OfferInput, SavedOffer } from "@/schemas/Offer.schema"

import { PreviewErrorBanner } from "./PreviewErrorBanner"
import { isConflict, isUnauthorized } from "../../core/createMethod.api"
import { createDefaultOfferInput } from "../helpers/createDefaultOfferInput"
import { describeMissingComponent } from "../helpers/describeMissingComponent"
import { useOffer } from "../hooks/useOffer"
import { offerApi, offerMutationKeys, offerQueries } from "../offer.api"

const AUTOSAVE_DEBOUNCE_MS = 800
const AUTOSAVE_RETRIES = 2

export function OfferFormProvider({ children }: { children: ReactNode }) {
  const form = useForm<OfferInput>({
    defaultValues: createDefaultOfferInput(),
    mode: "onChange",
    reValidateMode: "onChange",
  })

  const { control, getValues, reset } = form
  const queryClient = useQueryClient()
  const { offer, offerId } = useOffer()

  const hydratedRef = useRef<Pick<SavedOffer, "id" | "updatedAt"> | null>(null)

  const hydrate = ({ id, updatedAt }: SavedOffer) => {
    hydratedRef.current = { id, updatedAt }
  }

  const autoSave = useMutation({
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

  const { isDirty } = useFormState({ control })
  const { isPending: isSaving, mutate: saveNow } = autoSave

  useEffect(() => {
    if (!offer) {
      return
    }

    const hydrated = hydratedRef.current
    const isSameOffer = hydrated?.id === offer.id

    if (
      isSameOffer &&
      (hydrated.updatedAt === offer.updatedAt || isDirty || isSaving)
    ) {
      return
    }

    hydrate(offer)
    reset(offer.input)
  }, [isDirty, isSaving, offer, reset])

  const watchedValues = useWatch({ control })

  useEffect(() => {
    if (!offerId || !isDirty || isSaving || offer?.id !== offerId) {
      return
    }

    const timeoutId = window.setTimeout(
      () => saveNow(getValues()),
      AUTOSAVE_DEBOUNCE_MS,
    )

    return () => window.clearTimeout(timeoutId)
  }, [getValues, isDirty, isSaving, offer?.id, offerId, saveNow, watchedValues])

  const missingComponent = offer?.missingComponent
  const errorMessage = missingComponent
    ? describeMissingComponent(missingComponent)
    : null
  const [dismissedMessage, setDismissedMessage] = useState<string | null>(null)
  const visibleErrorMessage =
    errorMessage && errorMessage !== dismissedMessage ? errorMessage : null

  return (
    <FormProvider {...form}>
      {visibleErrorMessage && (
        <PreviewErrorBanner
          message={visibleErrorMessage}
          onDismiss={() => setDismissedMessage(visibleErrorMessage)}
        />
      )}
      {children}
    </FormProvider>
  )
}
