import { useQuery } from "@tanstack/react-query"

import { InventoryItem } from "./InventoryItem"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../core/ui/dialog"
import { textEyebrow, textName } from "../../core/ui/typography"
import { useIsAdmin } from "../../user/hooks/useIsAdmin"
import { inventoryQueries } from "../inventory.api"

function describeDialog({
  componentId,
  isAdmin,
}: {
  componentId?: string
  isAdmin: boolean
}) {
  if (!componentId) return "Nowy element"

  return isAdmin ? "Edycja elementu" : "Podgląd elementu"
}

export function InventoryItemDialog({
  componentId,
  onOpenChange,
}: {
  componentId?: string
  onOpenChange: (open: boolean) => void
}) {
  const isAdmin = useIsAdmin()
  const { data, isPending } = useQuery({
    ...inventoryQueries.list(),
    enabled: !!componentId,
    select: (items) => items.find(({ id }) => id === componentId),
  })

  if (componentId && isPending) return null

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent
        className="p-6 sm:max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="gap-0.5">
          <span className={textEyebrow}>
            {describeDialog({ componentId, isAdmin })}
          </span>
          <DialogTitle className={textName}>{data?.label ?? ""}</DialogTitle>
        </DialogHeader>
        <InventoryItem
          defaultValues={data ?? undefined}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
