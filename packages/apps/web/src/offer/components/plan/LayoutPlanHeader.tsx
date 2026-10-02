import { Copy, Trash2 } from "lucide-react"
import { useFormContext } from "react-hook-form"

import { OfferInput, OfferOutput } from "@/schemas/Offer.schema"

import { Badge } from "../../../core/ui/badge"
import { Button } from "../../../core/ui/button"
import { Input } from "../../../core/ui/input"
import { Label } from "../../../core/ui/label"

export function LayoutPlanHeader({
  hasLayoutCount = true,
  layoutIndex,
  onDuplicate,
  onRemove,
  preview,
}: {
  hasLayoutCount?: boolean
  layoutIndex: number
  onDuplicate: () => void
  onRemove: () => void
  preview: OfferOutput["layouts"][number] | undefined
}) {
  const { register } = useFormContext<OfferInput>()

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Badge variant="secondary">{layoutIndex + 1}</Badge>
        <p className="text-sm text-muted-foreground">
          {preview?.description ?? "liczenie…"}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {hasLayoutCount && (
          <>
            <Label className="text-sm text-muted-foreground">
              Liczba ciągów
            </Label>
            <Input
              {...register(`layouts.${layoutIndex}.numberOfLayouts`, {
                valueAsNumber: true,
              })}
              className="h-8 w-16"
              min={1}
              type="number"
            />
          </>
        )}
        <Button
          aria-label="Powiel ciąg"
          onClick={onDuplicate}
          size="icon"
          type="button"
          variant="outline"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          aria-label="Usuń ciąg"
          className="text-destructive hover:text-destructive"
          onClick={onRemove}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
