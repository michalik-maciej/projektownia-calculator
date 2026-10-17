import { Controller, useFormContext } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { CATEGORY_REQUIREMENTS } from "@/schemas/inventory/Component.schema"

import { type InventoryItemFormValues } from "./InventoryItem"
import { Input } from "../../core/ui/input"
import { Label } from "../../core/ui/label"
import { textEyebrow } from "../../core/ui/typography"
import { cn } from "../../core/ui/utils"
import { getDimensionOptions } from "../../inventory/helpers/getDimensionOptions"
import { inventoryQueries } from "../inventory.api"

interface Props {
  dimension: "width" | "height" | "depth"
  label: string
}

export const InventoryItemDimensionField = ({ dimension, label }: Props) => {
  const { data: optionsByCategory } = useQuery({
    ...inventoryQueries.list(),
    select: (data) =>
      getDimensionOptions({
        dimension,
        inventoryItems: data,
      }),
  })
  const { control, watch } = useFormContext<InventoryItemFormValues>()
  const category = watch("category")
  const suggestions =
    category && optionsByCategory ? optionsByCategory[category] : []
  const isRequired =
    CATEGORY_REQUIREMENTS[category]?.required.includes(dimension) ?? false
  const suggestionsId = `inventory-${dimension}-suggestions`

  return (
    <div className="flex flex-col space-y-1 gap-2">
      <Label
        className={cn(
          textEyebrow,
          isRequired && "font-semibold text-foreground",
        )}
      >
        {label}
      </Label>
      <Controller
        name={dimension}
        control={control}
        rules={{
          validate: (value) => {
            if (value == null) {
              return isRequired ? "Pole wymagane" : true
            }

            if (typeof value !== "number" || !Number.isFinite(value)) {
              return "Nieprawidłowa wartość"
            }

            return value > 0 || "Wartość musi być dodatnia"
          },
        }}
        render={({ field, fieldState }) => (
          <>
            <Input
              list={suggestionsId}
              min={0}
              name={field.name}
              onBlur={field.onBlur}
              onChange={(e) => {
                const raw = e.target.value
                field.onChange(raw === "" ? null : Number(raw))
              }}
              className="font-mono"
              placeholder="—"
              ref={field.ref}
              type="number"
              inputMode="numeric"
              value={field.value == null ? "" : String(field.value)}
            />
            <datalist id={suggestionsId}>
              {suggestions.map((value) => (
                <option key={value} value={value} />
              ))}
            </datalist>
            <p
              className={`text-xs text-destructive min-h-5 ${
                fieldState.error?.message ? "" : "invisible"
              }`}
            >
              {fieldState.error?.message}
            </p>
          </>
        )}
      />
    </div>
  )
}
