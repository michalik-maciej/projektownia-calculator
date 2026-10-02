import { OfferOutput } from "@/schemas/Offer.schema"

export type OfferRow = {
  basePrice: number | null
  description: string | null
  key: string
}

export function buildOfferRows(
  layoutKeys: string[],
  layoutOutputs: OfferOutput["layouts"] | undefined,
): OfferRow[] {
  return layoutKeys.flatMap((key, index) => {
    const layoutOutput = layoutOutputs?.[index]

    if (layoutOutput?.lines) {
      return layoutOutput.lines.map(
        ({ basePrice, description }, lineIndex) => ({
          basePrice,
          description,
          key: `${key}-${lineIndex}`,
        }),
      )
    }

    return [
      {
        basePrice: layoutOutput?.basePrice ?? null,
        description: layoutOutput?.description ?? null,
        key,
      },
    ]
  })
}
