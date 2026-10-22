import { useFormContext, useWatch } from "react-hook-form"

import { OfferInput } from "@/schemas/Offer.schema"

import { ColorName } from "./ColorName"
import {
  DEFAULT_METAL_COLOR,
  DEFAULT_PRICE_STRIP_COLOR,
  METAL_COLOR_SWATCHES,
  PRICE_STRIP_COLOR_SWATCHES,
} from "../helpers/offerColors"

export function OfferColors() {
  const { control } = useFormContext<OfferInput>()
  const [
    hasPriceStrips,
    metalColor = DEFAULT_METAL_COLOR,
    priceStripColor = DEFAULT_PRICE_STRIP_COLOR,
  ] = useWatch({
    control,
    name: ["hasPriceStrips", "metalColor", "priceStripColor"],
  })

  return (
    <p className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
      <span className="inline-flex gap-1.5">
        Kolor metalu:
        <span className="text-foreground">
          <ColorName {...METAL_COLOR_SWATCHES[metalColor]} />
        </span>
      </span>
      {hasPriceStrips && (
        <span className="inline-flex gap-1.5">
          Kolor listew cenowych:
          <span className="text-foreground">
            <ColorName {...PRICE_STRIP_COLOR_SWATCHES[priceStripColor]} />
          </span>
        </span>
      )}
    </p>
  )
}
