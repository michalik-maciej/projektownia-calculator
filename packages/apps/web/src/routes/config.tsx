import { FilePlus2 } from "lucide-react"
import { createFileRoute } from "@tanstack/react-router"

import { Button } from "../core/ui/button"
import { MissingOfferNotice } from "../offer/components/MissingOfferNotice"
import { OfferLayouts } from "../offer/components/OfferLayouts"
import { useCreateOffer } from "../offer/hooks/useCreateOffer"
import { useOffer } from "../offer/hooks/useOffer"

export const Route = createFileRoute("/config")({
  component: ConfigPage,
})

function ConfigPage() {
  const { isMissing, offer, offerId } = useOffer({ keepFresh: true })
  const createOffer = useCreateOffer()

  return (
    <section>
      {isMissing && (
        <div className="px-8 pt-6">
          <MissingOfferNotice />
        </div>
      )}

      {offerId && !isMissing && (
        <OfferLayouts output={offer?.output ?? undefined} />
      )}

      {!offerId && (
        <div className="flex flex-col items-start gap-3 px-8 pt-6">
          <p className="text-sm text-muted-foreground">
            Nie masz otwartej oferty. Utwórz nową albo wczytaj zapisaną w
            zakładce Oferta.
          </p>
          <Button
            disabled={createOffer.isPending}
            onClick={() => createOffer.mutate()}
            type="button"
          >
            <FilePlus2 className="h-4 w-4" />
            Nowa oferta
          </Button>
        </div>
      )}
    </section>
  )
}
