import { ReactNode, useEffect, useRef, useState } from "react"
import { FormProvider, useForm, useFormState, useWatch } from "react-hook-form"

import { OfferInput, SavedOffer } from "@/schemas/Offer.schema"

import { PreviewErrorBanner } from "./PreviewErrorBanner"
import { createDefaultOfferInput } from "../helpers/createDefaultOfferInput"
import { describeMissingComponent } from "../helpers/describeMissingComponent"
import { HydratedOffer, useAutoSaveOffer } from "../hooks/useAutoSaveOffer"
import { useOffer } from "../hooks/useOffer"

const AUTOSAVE_DEBOUNCE_MS = 800

export function OfferFormProvider({ children }: { children: ReactNode }) {
  const form = useForm<OfferInput>({
    defaultValues: createDefaultOfferInput(),
    mode: "onChange",
    reValidateMode: "onChange",
  })

  const { control, getValues, reset } = form
  const { offer, offerId } = useOffer()

  const hydratedRef = useRef<HydratedOffer | null>(null)

  const hydrate = ({ id, updatedAt }: SavedOffer) => {
    hydratedRef.current = { id, updatedAt }
  }

  const autoSave = useAutoSaveOffer({ hydratedRef, offerId, reset })

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
