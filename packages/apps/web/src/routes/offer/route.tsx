import { FilePlus2, Loader2, Share2, Trash2 } from "lucide-react"
import { useState } from "react"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"
import { createFileRoute } from "@tanstack/react-router"

import { OfferInput } from "@/schemas/Offer.schema"

import { Button } from "../../core/ui/button"
import { ConfirmDialog } from "../../core/ui/confirm-dialog"
import { Input } from "../../core/ui/input"
import { Label } from "../../core/ui/label"
import {
  textEyebrow,
  textFigure,
  textName,
  textSection,
} from "../../core/ui/typography"
import { LayoutCode } from "../../offer/components/LayoutCode"
import { MissingOfferNotice } from "../../offer/components/MissingOfferNotice"
import { OfferList } from "../../offer/components/OfferList"
import { OfferShareDialog } from "../../offer/components/OfferShareDialog"
import { buildOfferRows } from "../../offer/helpers/buildOfferRows"
import { formatPrice } from "../../offer/helpers/formatPrice"
import { useCreateOffer } from "../../offer/hooks/useCreateOffer"
import { useDeleteOffer } from "../../offer/hooks/useDeleteOffer"
import { useOffer } from "../../offer/hooks/useOffer"
import { useIsAdmin } from "../../user/hooks/useIsAdmin"

export const Route = createFileRoute("/offer")({
  component: OfferPage,
})

function OfferPage() {
  const {
    control,
    formState: { errors },
    register,
  } = useFormContext<OfferInput>()
  const { fields } = useFieldArray({ control, name: "layouts" })
  const layouts = useWatch({ control, name: "layouts" })

  const { isMissing, offer, offerId } = useOffer({ keepFresh: true })
  const createOffer = useCreateOffer()
  const deleteOffer = useDeleteOffer()
  const isAdmin = useIsAdmin()
  const [confirming, setConfirming] = useState<"delete" | "new" | null>(null)

  const hasOpenOffer = !!offerId && !isMissing
  const output = offer?.output

  return (
    <section className="flex max-w-5xl flex-col gap-6 p-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
          {hasOpenOffer && (
            <>
              <div className="flex w-80 flex-col gap-1.5">
                <Label className={textEyebrow}>Opis oferty</Label>
                <Input
                  className={`${textFigure} md:text-[15px]`}
                  {...register("title", {
                    required: "Opis jest wymagany",
                    validate: (value) =>
                      value.trim().length > 0 || "Opis nie może być pusty",
                  })}
                  placeholder="Opis"
                />
              </div>
              <div className="flex w-24 flex-col gap-1.5">
                <Label className={textEyebrow}>Rabat (%)</Label>
                <Input
                  className={`${textFigure} text-center md:text-[15px]`}
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
          {isAdmin && hasOpenOffer && (
            <OfferShareDialog offerId={offerId}>
              <Button type="button" variant="outline">
                <Share2 className="h-4 w-4" />
                Udostępnij
              </Button>
            </OfferShareDialog>
          )}
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
            <table className="w-full border bg-card text-sm">
              <thead
                className={`border-b-[1.5px] border-foreground text-left text-muted-foreground ${textSection}`}
              >
                <tr>
                  <th className="w-20 px-3 py-2">Lp.</th>
                  <th className="px-3 py-2">Opis</th>
                  <th className="w-20 px-3 py-2 text-right">Ilość</th>
                  <th className="w-40 px-3 py-2 text-right">Cena</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {buildOfferRows({
                  keys: fields.map((field) => field.id),
                  layoutOutputs: output?.layouts,
                  layouts,
                  priceStrips: output?.priceStrips,
                }).map(
                  ({
                    basePrice,
                    code,
                    description,
                    key,
                    name,
                    quantity,
                    unit,
                  }) => (
                    <tr key={key}>
                      <td className="px-3 py-2">
                        {code && <LayoutCode code={code} />}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col gap-0.5">
                          <span className={textName}>{name}</span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {description ?? "brak wyceny"}
                          </span>
                        </div>
                      </td>
                      <td className={`px-3 py-2 text-right ${textFigure}`}>
                        {quantity?.toLocaleString("pl-PL") ?? "—"}
                        {unit && ` ${unit}`}
                      </td>
                      <td className={`px-3 py-2 text-right ${textFigure}`}>
                        {basePrice === null ? "—" : formatPrice(basePrice)}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          )}

          {output && (
            <dl className="ml-auto flex w-90 flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <dt className={textEyebrow}>Wartość</dt>
                <dd className={textFigure}>
                  {formatPrice(output.pricing.basePrice)}
                </dd>
              </div>
              <div className="mt-1 flex items-baseline justify-between border-t-[1.5px] border-foreground pt-2">
                <dt className={`flex items-center gap-2 ${textSection}`}>
                  <span aria-hidden="true" className="size-2.5 bg-highlight" />
                  Po rabacie {output.pricing.discountPercentage}%
                </dt>
                <dd className="font-display text-lg font-semibold tabular-nums">
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
            deleteOffer.mutate(offerId ?? "")
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
