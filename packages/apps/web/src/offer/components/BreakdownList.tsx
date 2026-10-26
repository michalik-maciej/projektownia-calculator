import { Fragment } from "react"

import { COMPONENT_CATEGORIES } from "@/schemas/inventory/Component.schema"
import { OfferOutput } from "@/schemas/Offer.schema"

import { textFigure, textSection } from "../../core/ui/typography"
import { CATEGORY_LABELS } from "../helpers/categoryLabels"
import { formatPrice } from "../helpers/formatPrice"

const priceCell = `px-3 text-right print:hidden ${textFigure}`

export function BreakdownList({
  breakdown,
  pricing,
}: {
  breakdown: OfferOutput["breakdown"] | undefined
  pricing?: OfferOutput["pricing"]
}) {
  if (!breakdown) {
    return <p className="text-sm text-muted-foreground">liczenie…</p>
  }

  const groups = COMPONENT_CATEGORIES.flatMap((category) => {
    const items = breakdown[category] ?? []
    return items.length === 0 ? [] : [{ category, items }]
  })

  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ten ciąg nie zawiera jeszcze żadnych elementów.
      </p>
    )
  }

  const columnCount = pricing ? 4 : 2
  const discountFactor = pricing ? 1 - pricing.discountPercentage / 100 : 1

  return (
    <table className="w-full border bg-card text-sm">
      <thead
        className={`border-b-[1.5px] border-foreground text-left text-muted-foreground ${textSection}`}
      >
        <tr>
          <th className="px-3 py-2">Element</th>
          <th className="px-3 py-2 text-right">Ilość</th>
          {pricing && (
            <>
              <th className="px-3 py-2 text-right print:hidden">Wg cennika</th>
              <th className="px-3 py-2 text-right print:hidden">
                Po rabacie {pricing.discountPercentage}%
              </th>
            </>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {groups.map(({ category, items }) => (
          <Fragment key={category}>
            <tr className="bg-muted">
              <th
                className={`px-3 py-1 text-left ${textSection}`}
                colSpan={columnCount}
              >
                {CATEGORY_LABELS[category]}
              </th>
            </tr>
            {items.map(({ basePrice, id, label, quantity }) => (
              <tr key={id}>
                <td className="truncate px-3 py-1.5">{label}</td>
                <td className={`px-3 text-right ${textFigure}`}>{quantity}</td>
                {pricing && (
                  <>
                    <td className={priceCell}>{formatPrice(basePrice)}</td>
                    <td className={priceCell}>
                      {formatPrice(basePrice * discountFactor)}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </Fragment>
        ))}
      </tbody>
      {pricing && (
        <tfoot className="border-t-[1.5px] border-foreground print:hidden">
          <tr>
            <th className={`px-3 py-2 text-left ${textSection}`} colSpan={2}>
              Razem
            </th>
            <td className={priceCell}>{formatPrice(pricing.basePrice)}</td>
            <td className={priceCell}>{formatPrice(pricing.discountPrice)}</td>
          </tr>
        </tfoot>
      )}
    </table>
  )
}
