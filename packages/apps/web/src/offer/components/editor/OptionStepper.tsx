import { Minus, Plus } from "lucide-react"
import { Controller, useFormContext } from "react-hook-form"

import { OfferInput } from "@/schemas/Offer.schema"

import { Button } from "../../../core/ui/button"
import { textFigure } from "../../../core/ui/typography"
import { NumberPath } from "../../offer.types"

const ValueDisplay = ({ value }: { value: number | null | undefined }) => (
  <span
    className={`flex h-8 w-12 shrink-0 items-center justify-center ${textFigure}`}
  >
    {value != null ? value : "—"}
  </span>
)

export function OptionStepper({
  label,
  name,
  options,
}: {
  label: string
  name: NumberPath
  options: number[]
}) {
  const { control } = useFormContext<OfferInput>()

  return (
    <div className="flex items-center gap-1.5">
      <span className="w-28 shrink-0 text-sm text-muted-foreground">
        {label}
      </span>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const currentIndex =
            field.value == null ? -1 : options.indexOf(field.value)

          return (
            <>
              <Button
                className="h-8 w-8 shrink-0"
                disabled={currentIndex <= 0}
                onClick={() => field.onChange(options[currentIndex - 1])}
                size="icon"
                type="button"
                variant="outline"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <ValueDisplay value={field.value} />
              <Button
                className="h-8 w-8 shrink-0"
                disabled={
                  options.length === 0 || currentIndex >= options.length - 1
                }
                onClick={() =>
                  field.onChange(
                    currentIndex === -1
                      ? options[0]
                      : options[currentIndex + 1],
                  )
                }
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
    </div>
  )
}
