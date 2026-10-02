import { useFieldArray, useFormContext, useWatch } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { COMPONENT_CATEGORIES } from "@/schemas/inventory/Component.schema"
import { OfferInput } from "@/schemas/Offer.schema"

import { CountStepper } from "./CountStepper"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
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

  const groups = COMPONENT_CATEGORIES.flatMap((category) => {
    const items = availableItems.filter((item) => item.category === category)
    return items.length === 0 ? [] : [{ category, items }]
  })

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <span className="w-28 shrink-0 text-sm text-muted-foreground">
          {label}
        </span>
        <Select
          key={entryValues.length}
          onValueChange={(id) => entries.append({ id, quantity: 1 })}
        >
          <SelectTrigger className="h-8 flex-1" disabled={groups.length === 0}>
            <SelectValue placeholder="Dodaj element" />
          </SelectTrigger>
          <SelectContent>
            {groups.map(({ category, items }) => (
              <SelectGroup key={category}>
                <SelectLabel>{CATEGORY_LABELS[category]}</SelectLabel>
                {items.map(({ id, label }) => (
                  <SelectItem key={id} value={id}>
                    {label}
                  </SelectItem>
                ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
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
