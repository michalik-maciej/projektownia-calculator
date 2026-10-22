import { Loader2, Share2 } from "lucide-react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import type { User } from "@/schemas/user/User.schema"

import { Button } from "../../core/ui/button"
import { Checkbox } from "../../core/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../../core/ui/dialog"
import { Label } from "../../core/ui/label"
import { usersQueries } from "../../user/users.api"
import { useSetOfferShares } from "../hooks/useSetOfferShares"
import { offerQueries } from "../offer.api"

function ShareForm({
  initialUserIds,
  offerId,
  onSaved,
  users,
}: {
  initialUserIds: string[]
  offerId: string
  onSaved: () => void
  users: User[]
}) {
  const [selected, setSelected] = useState(new Set(initialUserIds))
  const setShares = useSetOfferShares(offerId)

  const toggle = (userId: string, checked: boolean) => {
    const next = new Set(selected)
    if (checked) next.add(userId)
    else next.delete(userId)
    setSelected(next)
  }

  return (
    <>
      {users.length === 0 ? (
        <DialogDescription>Nie ma kont pracowników.</DialogDescription>
      ) : (
        <ul className="flex flex-col gap-2">
          {users.map((user) => (
            <li className="flex items-center gap-2" key={user.id}>
              <Checkbox
                checked={selected.has(user.id)}
                id={`share-${user.id}`}
                onCheckedChange={(checked) => toggle(user.id, checked === true)}
              />
              <Label htmlFor={`share-${user.id}`}>{user.email}</Label>
            </li>
          ))}
        </ul>
      )}
      <div className="flex justify-end">
        <Button
          disabled={setShares.isPending}
          onClick={() =>
            setShares.mutate([...selected], { onSuccess: onSaved })
          }
          type="button"
        >
          {setShares.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Zapisz
        </Button>
      </div>
    </>
  )
}

export function OfferShareDialog({ offerId }: { offerId: string }) {
  const [isOpen, setIsOpen] = useState(false)

  const users = useQuery({ ...usersQueries.list(), enabled: isOpen })
  const shares = useQuery({ ...offerQueries.shares(offerId), enabled: isOpen })

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          <Share2 className="h-4 w-4" />
          Udostępnij
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Udostępnij ofertę</DialogTitle>
        {(users.isError || shares.isError) && (
          <DialogDescription className="text-destructive">
            Nie udało się wczytać listy udostępnień.
          </DialogDescription>
        )}
        {(users.isPending || shares.isPending) && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {users.data && shares.data && (
          <ShareForm
            initialUserIds={shares.data.userIds}
            offerId={offerId}
            onSaved={() => setIsOpen(false)}
            users={users.data.filter(({ role }) => role === "USER")}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
