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
}
