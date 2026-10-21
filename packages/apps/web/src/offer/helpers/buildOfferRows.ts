import { OfferInput, OfferOutput } from "@/schemas/Offer.schema"

import { formatLayoutCode } from "./formatLayoutCode"
import { getLayoutName } from "./getLayoutName"

export type OfferRow = {
  basePrice: number | null
  code: string | null
  description: string | null
  key: string
  name: string | null
  quantity: number | null
  unit?: string
}

export function buildOfferRows({
  keys,
  layoutOutputs,
  layouts,
  priceStrips,
}: {
  keys: string[]
  layoutOutputs: OfferOutput["layouts"] | undefined
  layouts: OfferInput["layouts"]
  priceStrips: OfferOutput["priceStrips"] | undefined
}): OfferRow[] {
  const layoutRows = keys.flatMap((key, index) => {
    const layout = layouts[index]
    const layoutOutput = layoutOutputs?.[index]
    const code = layout ? formatLayoutCode(index, layout) : null
    const name = layout ? getLayoutName(layout) : null

    if (layoutOutput?.lines) {
      return layoutOutput.lines.map((line, lineIndex) => ({
        ...line,
        code,
        key: `${key}-${lineIndex}`,
        name,
      }))
    }

    return [
      {
        basePrice: layoutOutput?.basePrice ?? null,
        code,
        description: layoutOutput?.description ?? null,
        key,
        name,
        quantity:
          layout && "numberOfLayouts" in layout ? layout.numberOfLayouts : null,
      },
    ]
  })

  if (!priceStrips) {
    return layoutRows
  }

  return [
    ...layoutRows,
    {
      ...priceStrips,
      code: null,
      description: "do wszystkich półek",
      key: "price-strips",
      name: "Listwy cenowe",
      unit: "mb",
    },
  ]
}
