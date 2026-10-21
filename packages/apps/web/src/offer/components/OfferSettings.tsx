import { Settings2 } from "lucide-react"
import { useId } from "react"
import { Controller, useFormContext, useWatch } from "react-hook-form"

import {
  METAL_COLORS,
  OfferInput,
  PRICE_STRIP_COLORS,
} from "@/schemas/Offer.schema"

import { ColorName } from "./ColorName"
import { Button } from "../../core/ui/button"
import { Checkbox } from "../../core/ui/checkbox"
import { Label } from "../../core/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "../../core/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../core/ui/select"
import { textEyebrow } from "../../core/ui/typography"
import {
  DEFAULT_METAL_COLOR,
  DEFAULT_PRICE_STRIP_COLOR,
  METAL_COLOR_SWATCHES,
  PRICE_STRIP_COLOR_SWATCHES,
} from "../helpers/offerColors"

export function OfferSettings() {
  const { control } = useFormContext<OfferInput>()
  const hasPriceStrips = useWatch({ control, name: "hasPriceStrips" }) ?? true
  const priceStripsId = useId()
  const priceStripColorId = useId()
  const metalColorId = useId()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="self-start" type="button" variant="default">
          <Settings2 className="h-4 w-4" />
          Ustawienia oferty
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-72 flex-col gap-4">
        <div className="flex items-center gap-1.5">
          <Controller
            control={control}
            name="hasPriceStrips"
            render={({ field }) => (
              <Checkbox
                checked={field.value ?? true}
                id={priceStripsId}
                onBlur={field.onBlur}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label className="cursor-pointer font-normal" htmlFor={priceStripsId}>
            Listwy cenowe do wszystkich półek
          </Label>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className={textEyebrow} htmlFor={priceStripColorId}>
            Kolor listew cenowych
          </Label>
          <Controller
            control={control}
            name="priceStripColor"
            render={({ field }) => (
              <Select
                disabled={!hasPriceStrips}
                onValueChange={field.onChange}
                value={field.value ?? DEFAULT_PRICE_STRIP_COLOR}
              >
                <SelectTrigger id={priceStripColorId}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_STRIP_COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      <ColorName {...PRICE_STRIP_COLOR_SWATCHES[color]} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className={textEyebrow} htmlFor={metalColorId}>
            Kolor metalu
          </Label>
          <Controller
            control={control}
            name="metalColor"
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value ?? DEFAULT_METAL_COLOR}
              >
                <SelectTrigger id={metalColorId}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {METAL_COLORS.map((color) => (
                    <SelectItem key={color} value={color}>
                      <ColorName {...METAL_COLOR_SWATCHES[color]} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
