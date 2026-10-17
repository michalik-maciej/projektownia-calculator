import { useFormContext, useFormState, useWatch } from "react-hook-form"

import { OfferInput } from "@/schemas/Offer.schema"

import { describeSaveState } from "../helpers/describeSaveState"
import { useAutoSaveState } from "../hooks/useAutoSaveState"
import { useOffer } from "../hooks/useOffer"

export function OfferSaveStatus() {
  const { control } = useFormContext<OfferInput>()
  const { isDirty } = useFormState({ control })
  const title = useWatch({ control, name: "title" })
  const { isMissing, offerId } = useOffer()
  const { hasFailed, isSaving } = useAutoSaveState()

  if (!offerId || isMissing) return null

  return (
    <span
      className={`font-mono text-xs ${
        hasFailed ? "text-destructive" : "text-muted-foreground"
      }`}
    >
      Oferta: {title} · {describeSaveState({ hasFailed, isDirty, isSaving })}
    </span>
  )
}
