import { FolderOpen, Loader2, Share2, Trash2 } from "lucide-react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import { OfferSummary } from "@/schemas/Offer.schema"

import { OfferShareDialog } from "./OfferShareDialog"
import { Button } from "../../core/ui/button"
import { ConfirmDialog } from "../../core/ui/confirm-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../../core/ui/dialog"
import { useIsAdmin } from "../../user/hooks/useIsAdmin"
import { useDeleteOffer } from "../hooks/useDeleteOffer"
import { offerQueries } from "../offer.api"

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  month: "2-digit",
  second: "2-digit",
  year: "numeric",
})

export function OfferList() {
  const [isOpen, setIsOpen] = useState(false)
  const [pendingOffer, setPendingOffer] = useState<OfferSummary | null>(null)

  const navigate = useNavigate()
  const isAdmin = useIsAdmin()
  const deleteOffer = useDeleteOffer()
  const [deletingOffer, setDeletingOffer] = useState<OfferSummary | null>(null)

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
      <DialogContent className="sm:max-w-3xl">
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
              <ul className="max-h-[60vh] divide-y divide-border overflow-y-auto border-y border-border">
                {offers.map((offer) => (
                  <li className="flex items-center gap-3 py-2" key={offer.id}>
                    <button
                      className="flex min-w-0 grow flex-col rounded-md px-1 py-1 text-left text-sm hover:bg-accent"
                      onClick={() => openOffer(offer.id)}
                      type="button"
                    >
                      <span className="truncate">{offer.title}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {offer.authorEmail}
                      </span>
                    </button>
                    <span className="flex shrink-0 flex-col items-end text-xs text-muted-foreground">
                      <span className="tabular-nums">
                        zmieniono{" "}
                        {dateFormatter.format(new Date(offer.updatedAt))}
                      </span>
                      {offer.lastUpdatedByEmail && (
                        <span>przez {offer.lastUpdatedByEmail}</span>
                      )}
                    </span>
                    {isAdmin && (
                      <OfferShareDialog offerId={offer.id}>
                        <Button
                          aria-label="Udostępnij"
                          size="icon"
                          title="Udostępnij"
                          type="button"
                          variant="outline"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </OfferShareDialog>
                    )}
                    <Button
                      aria-label="Usuń"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeletingOffer(offer)}
                      size="icon"
                      title="Usuń"
                      type="button"
                      variant="outline"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        <ConfirmDialog
          confirmLabel="Usuń ofertę"
          description={`Usunięcia oferty „${deletingOffer?.title ?? ""}” nie da się cofnąć.`}
          isPending={deleteOffer.isPending}
          onConfirm={() => {
            if (deletingOffer) deleteOffer.mutate(deletingOffer.id)
            setDeletingOffer(null)
          }}
          onOpenChange={(open) => !open && setDeletingOffer(null)}
          open={deletingOffer !== null}
          title="Usunąć ofertę?"
        />
      </DialogContent>
    </Dialog>
  )
}
