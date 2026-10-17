import { Copy, Trash2 } from "lucide-react"
import { useFormContext, useWatch } from "react-hook-form"

import { OfferInput, OfferOutput } from "@/schemas/Offer.schema"

import { Button } from "../../../core/ui/button"
import { Input } from "../../../core/ui/input"
import { Label } from "../../../core/ui/label"
import { textFigure, textName } from "../../../core/ui/typography"
import { formatLayoutCode } from "../../helpers/formatLayoutCode"
import { getLayoutName } from "../../helpers/getLayoutName"
import { LayoutCode } from "../LayoutCode"

export function LayoutPlanHeader({
  hasLayoutCount = true,
  isSelected,
  layoutIndex,
  onDuplicate,
  onRemove,
  preview,
}: {
  hasLayoutCount?: boolean
  isSelected: boolean
  layoutIndex: number
  onDuplicate: () => void
  onRemove: () => void
  preview: OfferOutput["layouts"][number] | undefined
}) {
  const { control, register } = useFormContext<OfferInput>()
  const layout = useWatch({ control, name: `layouts.${layoutIndex}` })

  if (!layout) return null

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <LayoutCode
          code={formatLayoutCode(layoutIndex, layout)}
          isHighlighted={isSelected}
        />
        <span className={textName}>{getLayoutName(layout)}</span>
        <p className="font-mono text-xs text-muted-foreground">
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
              className={`h-8 w-14 text-center ${textFigure} md:text-[15px]`}
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
