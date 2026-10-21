import { useId } from "react"
import { Controller, useFormContext } from "react-hook-form"

import {
  BACK_VARIANTS,
  DEFAULT_BACK_VARIANT,
} from "@/schemas/LayoutWall.schema"
import { OfferInput } from "@/schemas/Offer.schema"

import { Button } from "../../../core/ui/button"
import { Checkbox } from "../../../core/ui/checkbox"
import { Label } from "../../../core/ui/label"
import { RunOptionsPath } from "../../offer.types"

export function RunOptionsFields({
  optionsPath,
}: {
  optionsPath: RunOptionsPath
}) {
  const { control } = useFormContext<OfferInput>()
  const baseCoverId = useId()
  const topCoverId = useId()

  return (
    <>
      <div className="flex items-center gap-1.5">
        <span className="w-28 shrink-0 text-sm text-muted-foreground">
          Plecy
        </span>
        <Controller
          control={control}
          name={`${optionsPath}.backVariant`}
          render={({ field }) => {
            const selectedVariant = field.value ?? DEFAULT_BACK_VARIANT

            return (
              <div className="flex gap-1">
                {BACK_VARIANTS.map((variant) => (
                  <Button
                    aria-pressed={selectedVariant === variant}
                    className="h-8 w-8 tabular-nums"
                    key={variant}
                    onClick={() => field.onChange(variant)}
                    size="icon"
                    type="button"
                    variant={
                      selectedVariant === variant ? "default" : "outline"
                    }
                  >
                    {variant}
                  </Button>
                ))}
              </div>
            )
          }}
        />
      </div>

      <div className="flex items-center gap-1.5">
        <Label
          className="w-28 shrink-0 cursor-pointer font-normal text-muted-foreground"
          htmlFor={baseCoverId}
        >
          Osłona dolna
        </Label>
        <Controller
          control={control}
          name={`${optionsPath}.hasBaseCover`}
          render={({ field }) => (
            <Checkbox
              checked={field.value ?? false}
              id={baseCoverId}
              onBlur={field.onBlur}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="flex items-center gap-1.5">
        <Label
          className="w-28 shrink-0 cursor-pointer font-normal text-muted-foreground"
          htmlFor={topCoverId}
        >
          Maskownica
        </Label>
        <Controller
          control={control}
          name={`${optionsPath}.hasTopCover`}
          render={({ field }) => (
            <Checkbox
              checked={field.value ?? false}
              id={topCoverId}
              onBlur={field.onBlur}
              onCheckedChange={field.onChange}
            />
          )}
        />
      </div>
    </>
  )
}
