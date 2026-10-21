import { Loader2 } from "lucide-react"
import { useState } from "react"

import { PriceInput } from "./PriceInput"
import { textFigure } from "../../core/ui/typography"
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
  const [value, setValue] = useState(item.price.toFixed(2))
  const [error, setError] = useState<string | null>(null)

  if (syncedPrice !== item.price) {
    setSyncedPrice(item.price)
    setValue(item.price.toFixed(2))
    setError(null)
  }

  if (isDemo) {
    return (
      <span className={`text-muted-foreground ${textFigure}`}>
        {formatPrice(item.price)}
      </span>
    )
  }

  const commit = () => {
    const parsed = parseInventoryPriceInput(value)

    if (parsed == null) {
      setError("Cena musi być dodatnia")
      setValue(item.price.toFixed(2))
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
        <PriceInput
          aria-label="Cena"
          className={`h-7 w-28 ${textFigure} md:text-[15px]`}
          onBlur={commit}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur()
          }}
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
