import { useQuery } from "@tanstack/react-query"

import { InventoryItem } from "./InventoryItem"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../core/ui/dialog"
import { textEyebrow, textName } from "../../core/ui/typography"
import { inventoryQueries } from "../inventory.api"

export function InventoryItemDialog({
  componentId,
  onOpenChange,
}: {
  componentId?: string
  onOpenChange: (open: boolean) => void
}) {
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
            {componentId ? "Edycja elementu" : "Nowy element"}
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
