import { createFileRoute } from "@tanstack/react-router"

import { BreakdownList } from "../offer/components/BreakdownList"
import { OfferColors } from "../offer/components/OfferColors"
import { useOffer } from "../offer/hooks/useOffer"

export const Route = createFileRoute("/order")({
  component: OrderPage,
})

function OrderPage() {
  const { offer } = useOffer({ keepFresh: true })

  return (
    <section className="flex max-w-2xl flex-col gap-4 p-8">
      {offer?.output ? (
        <>
          <OfferColors />
          <BreakdownList breakdown={offer.output.breakdown} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nie ma jeszcze czego rozpisać. Zbuduj ofertę w Konfiguratorze, a
          rozpiska pojawi się tutaj.
        </p>
      )}
    </section>
  )
}
