import { Copy, Trash2 } from "lucide-react"
import { useId } from "react"
import {
  Controller,
  useFormContext,
  useFormState,
  useWatch,
} from "react-hook-form"

import { OfferInput, OfferOutput } from "@/schemas/Offer.schema"

import { Badge } from "../../../core/ui/badge"
import { Button } from "../../../core/ui/button"
import { Input } from "../../../core/ui/input"
import { Label } from "../../../core/ui/label"
import { Switch } from "../../../core/ui/switch"
import { textFigure, textName } from "../../../core/ui/typography"
import { formatLayoutCode } from "../../helpers/formatLayoutCode"
import { getLayoutName } from "../../helpers/getLayoutName"
import { LayoutCode } from "../LayoutCode"

const MIN_LAYOUT_COUNT = 1

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
  const { control, getFieldState, register } = useFormContext<OfferInput>()
  const inOfferId = useId()
  const layoutCountId = useId()
  const layout = useWatch({ control, name: `layouts.${layoutIndex}` })
  const layoutCountName = `layouts.${layoutIndex}.numberOfLayouts` as const
  const formState = useFormState({ control, name: layoutCountName })
  const layoutCountError = getFieldState(layoutCountName, formState).error
    ?.message

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
        {layout.drawingRunNumber !== undefined && (
          <Badge variant="outline">PDF ({layout.drawingRunNumber})</Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Label
          className="cursor-pointer text-sm text-muted-foreground"
          htmlFor={inOfferId}
        >
          Wliczaj do oferty
        </Label>
        <Controller
          control={control}
          name={`layouts.${layoutIndex}.isExcludedFromOffer`}
          render={({ field }) => (
            <Switch
              checked={!field.value}
              id={inOfferId}
              onBlur={field.onBlur}
              onCheckedChange={(isInOffer) => field.onChange(!isInOffer)}
            />
          )}
        />
        {hasLayoutCount && (
          <>
            <ActionDivider />
            <Label
              className="text-sm text-muted-foreground"
              htmlFor={layoutCountId}
            >
              Liczba ciągów
            </Label>
            <div className="relative">
              <Input
                {...register(layoutCountName, {
                  valueAsNumber: true,
                  validate: (value) =>
                    (Number.isInteger(value) && value >= MIN_LAYOUT_COUNT) ||
                    `Minimum ${MIN_LAYOUT_COUNT}`,
                })}
                aria-invalid={!!layoutCountError}
                className={`h-8 w-14 text-center ${textFigure} md:text-[15px]`}
                id={layoutCountId}
                min={MIN_LAYOUT_COUNT}
                type="number"
              />
              {layoutCountError && (
                <span className="absolute top-full left-1/2 mt-1 -translate-x-1/2 text-xs whitespace-nowrap text-destructive">
                  {layoutCountError}
                </span>
              )}
            </div>
          </>
        )}
        <ActionDivider />
        <Button
          aria-label="Powiel ciąg"
          onClick={onDuplicate}
          size="icon"
          type="button"
          variant="outline"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <ActionDivider />
        <Button
          aria-label="Usuń ciąg"
          className="text-destructive hover:text-destructive"
          onClick={onRemove}
          size="icon"
          type="button"
          variant="outline"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}

function ActionDivider() {
  return <div aria-hidden className="h-1 w-1 mx-1 bg-foreground/80" />
}
