import { Loader2 } from "lucide-react"
import { useState } from "react"

import { Input } from "../../core/ui/input"
import { formatPrice } from "../../offer/helpers/formatPrice"
import { useIsDemo } from "../../user/hooks/useIsDemo"
import { parseInventoryPriceInput } from "../helpers/parseInventoryPriceInput"
import { useUpdateInventoryItem } from "../hooks/useUpdateInventoryItem"
import type { InventoryItem } from "../inventory.api"

type Props = {
  item: InventoryItem
}

export function InventoryItemPriceField({ item }: Props) {
  const isDemo = useIsDemo()
  const updateMutation = useUpdateInventoryItem()
  const [syncedPrice, setSyncedPrice] = useState(item.price)
  const [value, setValue] = useState(String(item.price))
  const [error, setError] = useState<string | null>(null)

  if (syncedPrice !== item.price) {
    setSyncedPrice(item.price)
    setValue(String(item.price))
    setError(null)
  }

  if (isDemo) {
    return (
      <span className="text-sm text-muted-foreground tabular-nums">
        {formatPrice(item.price)}
      </span>
    )
  }

  const commit = () => {
    const parsed = parseInventoryPriceInput(value)

    if (parsed == null) {
      setError("Cena musi być dodatnia")
      setValue(String(item.price))
      return
    }

    setError(null)

    if (parsed !== item.price) {
      updateMutation.mutate({ id: item.id, data: { price: parsed } })
    }
  }

  return (
    <div className="flex flex-col items-end gap-0.5">
      <div className="flex items-center gap-1">
        <Input
          aria-label="Cena"
          className="h-7 w-24 text-right tabular-nums"
          min={0}
          onBlur={commit}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur()
          }}
          step="0.01"
          type="number"
          value={value}
        />
        {updateMutation.isPending && (
          <Loader2 className="h-3 w-3 shrink-0 animate-spin text-muted-foreground" />
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
