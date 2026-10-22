import { FolderOpen, Loader2 } from "lucide-react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import { OfferSummary } from "@/schemas/Offer.schema"

import { Button } from "../../core/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../../core/ui/dialog"
import { useIsAdmin } from "../../user/hooks/useIsAdmin"
import { offerQueries } from "../offer.api"

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "2-digit",
  year: "numeric",
})

export function OfferList() {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingOffer, setPendingOffer] = useState<OfferSummary | null>(null)

  const navigate = useNavigate()
  const isAdmin = useIsAdmin()

  const { data: offers, isPending } = useQuery({
    ...offerQueries.list(),
    enabled: isOpen,
  })

  const openOffer = (id: string) => {
    navigate({ search: { offerId: id }, to: "." })
    setPendingOffer(null)
    setIsOpen(false)
  }

  return (
    <Dialog
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) setPendingOffer(null)
      }}
      open={isOpen}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <FolderOpen className="h-4 w-4" />
          Wczytaj
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Zapisane oferty</DialogTitle>

        {pendingOffer ? (
          <>
            <DialogDescription>
              W bieżącej ofercie są zmiany, które nie zostały zapisane.
              Wczytanie „{pendingOffer.title}” je odrzuci.
            </DialogDescription>
            <div className="flex justify-end gap-2">
              <Button
                onClick={() => setPendingOffer(null)}
                type="button"
                variant="outline"
              >
                Anuluj
              </Button>
              <Button onClick={() => openOffer(pendingOffer.id)} type="button">
                Wczytaj mimo to
              </Button>
            </div>
          </>
        ) : (
          <>
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {!isPending && offers?.length === 0 && (
              <DialogDescription>
                Nie ma jeszcze żadnej zapisanej oferty.
              </DialogDescription>
            )}
            {!isPending && offers && offers.length > 0 && (
              <ul className="divide-y divide-border border-y border-border">
                {offers.map((offer) => (
                  <li key={offer.id}>
                    <button
                      className="flex w-full items-center justify-between gap-4 px-1 py-2 text-left text-sm hover:bg-accent"
                      onClick={() => openOffer(offer.id)}
                      type="button"
                    >
                      <span className="flex min-w-0 flex-col">
                        <span className="truncate">{offer.title}</span>
                        {isAdmin && (
                          <span className="truncate text-xs text-muted-foreground">
                            {offer.authorEmail}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {dateFormatter.format(new Date(offer.updatedAt))}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
