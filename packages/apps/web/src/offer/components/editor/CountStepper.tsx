import { Minus, Plus, Trash2 } from "lucide-react"
import { Controller, useFormContext } from "react-hook-form"

import { OfferInput } from "@/schemas/Offer.schema"

import { Button } from "../../../core/ui/button"
import { textFigure } from "../../../core/ui/typography"
import { NumberPath } from "../../offer.types"

/**
 * Row with a label and a minus/value/plus stepper.
 *
 * @param min lower bound for the value; omit to let it run below zero, which is
 * how an extra subtracts components the rules over-counted.
 */
export function CountStepper({
  label,
  min,
  name,
  onRemove,
}: {
  label: string
  min?: number
  name: NumberPath
  onRemove?: () => void
}) {
  const { control } = useFormContext<OfferInput>()

  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-28 shrink-0 truncate text-sm text-muted-foreground"
        title={label}
      >
        {label}
      </span>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const value = field.value ?? min ?? 0

          return (
            <>
              <Button
                className="h-8 w-8 shrink-0"
                disabled={min != null && value <= min}
                onClick={() => field.onChange(value - 1)}
                size="icon"
                type="button"
                variant="outline"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span
                className={`flex h-8 w-12 shrink-0 items-center justify-center ${textFigure}`}
              >
                {value}
              </span>
              <Button
                className="h-8 w-8 shrink-0"
                onClick={() => field.onChange(value + 1)}
                size="icon"
                type="button"
                variant="outline"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </>
          )
        }}
      />
      {onRemove && (
        <Button
          className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
          onClick={onRemove}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
