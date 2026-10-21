import { Info } from "lucide-react"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../core/ui/tooltip"
import { RunOptionsPath } from "../../offer.types"

export function RunOptionsFields({
  areGondolaSidesUnlinked = false,
  optionsPath,
}: {
  areGondolaSidesUnlinked?: boolean
  optionsPath: RunOptionsPath
}) {
  const { control } = useFormContext<OfferInput>()
  const baseCoverId = useId()
  const topCoverId = useId()
  const isSecondGondolaSide = optionsPath.endsWith(".sides.1")
  const topCoverPath = isSecondGondolaSide
    ? (optionsPath.replace(/1$/, "0") as RunOptionsPath)
    : optionsPath

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
        <div className="flex w-28 shrink-0 items-center gap-1">
          <Label
            className="cursor-pointer font-normal text-muted-foreground"
            htmlFor={topCoverId}
          >
            Maskownica
          </Label>
          {areGondolaSidesUnlinked && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  aria-label="Jak liczone są maskownice"
                  className="text-muted-foreground hover:text-foreground"
                  type="button"
                >
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {isSecondGondolaSide
                  ? "Maskownica jest wspólna dla obu stron gondoli i liczona według regałów strony 1."
                  : "Rozpiska maskownic wynika z układu regałów strony 1."}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <Controller
          control={control}
          name={`${topCoverPath}.hasTopCover`}
          render={({ field }) => (
            <Checkbox
              checked={field.value ?? false}
              disabled={isSecondGondolaSide}
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
