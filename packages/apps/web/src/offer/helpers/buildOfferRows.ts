import { OfferInput, OfferOutput } from "@/schemas/Offer.schema"

export type OfferRow = {
  basePrice: number | null
  description: string | null
  key: string
  quantity: number | null
}

export function buildOfferRows({
  keys,
  layoutOutputs,
  layouts,
}: {
  keys: string[]
  layoutOutputs: OfferOutput["layouts"] | undefined
  layouts: OfferInput["layouts"]
}): OfferRow[] {
  return keys.flatMap((key, index) => {
    const layout = layouts[index]
    const layoutOutput = layoutOutputs?.[index]

    if (layoutOutput?.lines) {
      return layoutOutput.lines.map((line, lineIndex) => ({
        ...line,
        key: `${key}-${lineIndex}`,
      }))
    }

    return [
      {
        basePrice: layoutOutput?.basePrice ?? null,
        description: layoutOutput?.description ?? null,
        key,
        quantity:
          layout && "numberOfLayouts" in layout ? layout.numberOfLayouts : null,
      },
    ]
  })
}
