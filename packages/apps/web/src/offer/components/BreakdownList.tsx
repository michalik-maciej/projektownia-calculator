import { Fragment } from "react"

import { COMPONENT_CATEGORIES } from "@/schemas/inventory/Component.schema"
import { OfferOutput } from "@/schemas/Offer.schema"

import { textFigure, textSection } from "../../core/ui/typography"
import { CATEGORY_LABELS } from "../helpers/categoryLabels"

export function BreakdownList({
  breakdown,
}: {
  breakdown: OfferOutput["breakdown"] | undefined
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

  return (
    <table className="w-full border bg-card text-sm">
      <thead
        className={`border-b-[1.5px] border-foreground text-left text-muted-foreground ${textSection}`}
      >
        <tr>
          <th className="px-3 py-2">Element</th>
          <th className="w-20 px-3 py-2 text-right">Ilość</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {groups.map(({ category, items }) => (
          <Fragment key={category}>
            <tr className="bg-muted">
              <th className={`px-3 py-1 text-left ${textSection}`} colSpan={2}>
                {CATEGORY_LABELS[category]}
              </th>
            </tr>
            {items.map(({ id, label, quantity }) => (
              <tr key={id}>
                <td className="truncate px-3 py-1.5">{label}</td>
                <td className={`px-3 text-right ${textFigure}`}>{quantity}</td>
              </tr>
            ))}
          </Fragment>
        ))}
      </tbody>
    </table>
  )
}
