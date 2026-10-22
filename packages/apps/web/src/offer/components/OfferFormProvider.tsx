import { ReactNode, useEffect, useRef, useState } from "react"
import { FormProvider, useForm, useFormState, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { OfferInput, SavedOffer } from "@/schemas/Offer.schema"

import { PreviewErrorBanner } from "./PreviewErrorBanner"
import { isUnauthorized } from "../../core/createMethod.api"
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

  const hydratedRef = useRef<{ id: string; input: string } | null>(null)

  const autoSave = useMutation({
    mutationKey: offerMutationKeys.autoSave,
    mutationFn: (values: OfferInput) =>
      offerApi.update({ data: values, params: { id: offerId ?? "" } }),
    retry: (failureCount, error) =>
      !isUnauthorized(error) && failureCount < AUTOSAVE_RETRIES,
    onSuccess: (saved: SavedOffer) => {
      hydratedRef.current = {
        id: saved.id,
        input: JSON.stringify(saved.input),
      }
      queryClient.setQueryData(offerQueries.details(saved.id).queryKey, saved)
      reset(getValues(), { keepValues: true })
    },
    onError: (error) => {
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

    const serverInput = JSON.stringify(offer.input)
    const hydrated = hydratedRef.current
    const isSameOffer = hydrated?.id === offer.id

    if (
      isSameOffer &&
      (hydrated.input === serverInput || isDirty || isSaving)
    ) {
      return
    }

    hydratedRef.current = { id: offer.id, input: serverInput }
    reset(offer.input)
  }, [isDirty, isSaving, offer, reset])

  const watchedValues = useWatch({ control })

  useEffect(() => {
    if (!offerId || !isDirty || offer?.id !== offerId) {
      return
    }

    const timeoutId = window.setTimeout(
      () => saveNow(getValues()),
      AUTOSAVE_DEBOUNCE_MS,
    )

    return () => window.clearTimeout(timeoutId)
  }, [getValues, isDirty, offer?.id, offerId, saveNow, watchedValues])

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
