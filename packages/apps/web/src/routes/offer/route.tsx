import { FilePlus2, Loader2, Trash2 } from "lucide-react"
import { useState } from "react"
import { useFieldArray, useFormContext, useFormState } from "react-hook-form"
import { createFileRoute } from "@tanstack/react-router"

import { OfferInput } from "@/schemas/Offer.schema"

import { Badge } from "../../core/ui/badge"
import { Button } from "../../core/ui/button"
import { ConfirmDialog } from "../../core/ui/confirm-dialog"
import { Input } from "../../core/ui/input"
import { Label } from "../../core/ui/label"
import { MissingOfferNotice } from "../../offer/components/MissingOfferNotice"
import { OfferList } from "../../offer/components/OfferList"
import { buildOfferRows } from "../../offer/helpers/buildOfferRows"
import { describeSaveState } from "../../offer/helpers/describeSaveState"
import { formatPrice } from "../../offer/helpers/formatPrice"
import { useAutoSaveState } from "../../offer/hooks/useAutoSaveState"
import { useCreateOffer } from "../../offer/hooks/useCreateOffer"
import { useDeleteOffer } from "../../offer/hooks/useDeleteOffer"
import { useOffer } from "../../offer/hooks/useOffer"

export const Route = createFileRoute("/offer")({
  component: OfferPage,
})

function OfferPage() {
  const {
    control,
    formState: { errors },
    register,
  } = useFormContext<OfferInput>()
  const { isDirty } = useFormState({ control })
  const { fields } = useFieldArray({ control, name: "layouts" })

  const { isMissing, offer, offerId } = useOffer()
  const { hasFailed, isSaving } = useAutoSaveState()
  const createOffer = useCreateOffer()
  const deleteOffer = useDeleteOffer()
  const [confirming, setConfirming] = useState<"delete" | "new" | null>(null)

  const hasOpenOffer = !!offerId && !isMissing
  const output = offer?.output

  return (
    <section className="flex max-w-5xl flex-col gap-6 p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <h1 className="text-xl font-semibold">Oferta</h1>
          {hasOpenOffer && (
            <>
              <div className="flex w-80 flex-col gap-1.5">
                <Label>Opis oferty</Label>
                <Input
                  {...register("title", {
                    required: "Opis jest wymagany",
                    validate: (value) =>
                      value.trim().length > 0 || "Opis nie może być pusty",
                  })}
                  placeholder="Opis"
                />
              </div>
              <div className="flex w-24 flex-col gap-1.5">
                <Label>Rabat (%)</Label>
                <Input
                  {...register("discountPercentage", {
                    setValueAs: (value) =>
                      value === "" || value === null || value === undefined
                        ? 0
                        : Number(value),
                    validate: (value) => {
                      if (!Number.isFinite(value)) return "Musi być liczbą"
                      if (value < 0) return "Minimum 0"
                      if (value > 100) return "Maksimum 100"
                      return true
                    },
                  })}
                  inputMode="numeric"
                  placeholder="Rabat"
                  type="number"
                />
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasOpenOffer && (
            <span
              className={`mr-2 text-xs ${
                hasFailed ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {describeSaveState({ hasFailed, isDirty, isSaving })}
            </span>
          )}
          <Button
            disabled={createOffer.isPending}
            onClick={() =>
              offerId ? setConfirming("new") : createOffer.mutate()
            }
            type="button"
            variant="outline"
          >
            {createOffer.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FilePlus2 className="h-4 w-4" />
            )}
            Nowa
          </Button>
          <OfferList />
          <Button
            className="text-destructive hover:text-destructive"
            disabled={!hasOpenOffer || deleteOffer.isPending}
            onClick={() => setConfirming("delete")}
            type="button"
            variant="outline"
          >
            <Trash2 className="h-4 w-4" />
            Usuń
          </Button>
        </div>
      </header>

      {!offerId && (
        <p className="text-sm text-muted-foreground">
          Nie masz otwartej oferty. Utwórz nową albo wczytaj zapisaną.
        </p>
      )}

      {isMissing && <MissingOfferNotice />}

      {hasOpenOffer && (
        <>
          <div className="flex min-h-5 flex-wrap gap-4 text-xs text-destructive">
            {errors.title?.message && <span>{errors.title.message}</span>}
            {errors.discountPercentage?.message && (
              <span>{errors.discountPercentage.message}</span>
            )}
          </div>

          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ta oferta nie ma jeszcze żadnych ciągów. Dodaj je w
              Konfiguratorze.
            </p>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {buildOfferRows(
                fields.map((field) => field.id),
                output?.layouts,
              ).map(({ basePrice, description, key }, index) => (
                <li className="flex items-center gap-4 py-2" key={key}>
                  <Badge variant="secondary">{index + 1}</Badge>
                  <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                    {description ?? "brak wyceny"}
                  </span>
                  <span className="w-32 shrink-0 text-right text-sm tabular-nums">
                    {basePrice === null ? "—" : formatPrice(basePrice)}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {output && (
            <dl className="flex flex-col gap-1 text-sm">
              <div className="flex items-center justify-end gap-4">
                <dt className="text-muted-foreground">Wartość</dt>
                <dd className="w-32 text-right tabular-nums">
                  {formatPrice(output.pricing.basePrice)}
                </dd>
              </div>
              <div className="flex items-center justify-end gap-4 font-semibold">
                <dt>Po rabacie {output.pricing.discountPercentage}%</dt>
                <dd className="w-32 text-right tabular-nums">
                  {formatPrice(output.pricing.discountPrice)}
                </dd>
              </div>
            </dl>
          )}
        </>
      )}

      <ConfirmDialog
        confirmLabel={
          confirming === "delete" ? "Usuń ofertę" : "Utwórz nową ofertę"
        }
        description={
          confirming === "delete"
            ? "Usunięcia zapisanej oferty nie da się cofnąć."
            : "Bieżąca oferta zostanie zamknięta. Jest zapisana, więc wrócisz do niej przez Wczytaj."
        }
        isPending={createOffer.isPending || deleteOffer.isPending}
        onConfirm={() => {
          if (confirming === "delete") {
            deleteOffer.mutate()
          } else {
            createOffer.mutate()
          }
          setConfirming(null)
        }}
        onOpenChange={(open) => !open && setConfirming(null)}
        open={confirming !== null}
        title={confirming === "delete" ? "Usunąć ofertę?" : "Nowa oferta"}
      />
    </section>
  )
}
