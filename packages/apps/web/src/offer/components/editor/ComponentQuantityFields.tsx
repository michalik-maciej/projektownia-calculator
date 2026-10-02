import { useFieldArray, useFormContext, useWatch } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { COMPONENT_CATEGORIES } from "@/schemas/inventory/Component.schema"
import { OfferInput } from "@/schemas/Offer.schema"

import { CountStepper } from "./CountStepper"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "../../../core/ui/select"
import { inventoryQueries } from "../../../inventory/inventory.api"
import { CATEGORY_LABELS } from "../../helpers/categoryLabels"
import { ComponentQuantitiesPath } from "../../offer.types"

export function ComponentQuantityFields({
  label,
  min,
  name,
}: {
  label: string
  min?: number
  name: ComponentQuantitiesPath
}) {
  const { control } = useFormContext<OfferInput>()
  const { data: inventoryItems = [] } = useQuery(inventoryQueries.list())

  const entries = useFieldArray({ control, name })
  const entryValues = useWatch({ control, name }) ?? []

  const addedIds = new Set(entryValues.map((entry) => entry.id))
  const availableItems = inventoryItems.filter(({ id }) => !addedIds.has(id))

  const categories = COMPONENT_CATEGORIES.filter((category) =>
    inventoryItems.some((item) => item.category === category),
  ).map((category) => ({
    category,
    items: availableItems.filter((item) => item.category === category),
  }))

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start gap-1.5">
        <span className="w-28 shrink-0 py-1 text-sm text-muted-foreground">
          {label}
        </span>
        <div className="flex flex-1 flex-wrap gap-1.5">
          {categories.map(({ category, items }) => (
            <Select
              key={`${category}-${entryValues.length}`}
              onValueChange={(id) => entries.append({ id, quantity: 1 })}
            >
              <SelectTrigger
                className="h-7 w-auto gap-1 px-2 text-xs"
                disabled={items.length === 0}
              >
                {CATEGORY_LABELS[category]}
              </SelectTrigger>
              <SelectContent>
                {items.map(({ id, label }) => (
                  <SelectItem key={id} value={id}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      </div>

      {entries.fields.length > 0 && (
        <ul className="flex flex-col gap-2">
          {entries.fields.map((field, entryIndex) => {
            const componentId = entryValues[entryIndex]?.id
            const item = inventoryItems.find(({ id }) => id === componentId)

            return (
              <li key={field.id}>
                <CountStepper
                  label={item?.label ?? componentId ?? ""}
                  min={min}
                  name={`${name}.${entryIndex}.quantity`}
                  onRemove={() => entries.remove(entryIndex)}
                />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
