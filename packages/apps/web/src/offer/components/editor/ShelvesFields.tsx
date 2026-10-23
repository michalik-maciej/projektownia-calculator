import { Plus } from "lucide-react"
import { useFieldArray, useFormContext } from "react-hook-form"

import { OfferInput } from "@/schemas/Offer.schema"

import { CountStepper } from "./CountStepper"
import { OptionStepper } from "./OptionStepper"
import { SectionLabel } from "./SectionLabel"
import { SectionNavigator } from "./SectionNavigator"
import { Button } from "../../../core/ui/button"
import { ShelvesPath } from "../../offer.types"

export function ShelvesFields({
  label = "Półki",
  newShelfCount,
  onSelectShelf,
  selectedShelfIndex,
  shelfDepthOptions,
  shelvesPath,
}: {
  label?: string
  newShelfCount: number
  onSelectShelf: (shelfIndex: number) => void
  selectedShelfIndex: number
  shelfDepthOptions: number[]
  shelvesPath: ShelvesPath
}) {
  const { control } = useFormContext<OfferInput>()
  const shelves = useFieldArray({ control, name: shelvesPath })

  const shelfCount = shelves.fields.length
  const shelfIndex = Math.min(selectedShelfIndex, Math.max(shelfCount - 1, 0))
  const shelfPath = `${shelvesPath}.${shelfIndex}` as const

  const handleAppend = () => {
    shelves.append({
      depth: shelfDepthOptions[0] ?? 0,
      numberOfShelves: newShelfCount,
    })
    onSelectShelf(shelfCount)
  }

  const handleRemove = () => {
    const wasLast = shelfIndex === shelfCount - 1

    shelves.remove(shelfIndex)
    onSelectShelf(wasLast ? Math.max(shelfIndex - 1, 0) : shelfIndex)
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-background p-4">
      <div className="flex items-center justify-between gap-2">
        <SectionLabel>{label}</SectionLabel>
        {shelfCount > 0 && (
          <SectionNavigator
            count={shelfCount}
            index={shelfIndex}
            onSelect={onSelectShelf}
          />
        )}
      </div>

      {shelfCount === 0 ? (
        <p className="text-sm text-muted-foreground">Ten regał nie ma półek.</p>
      ) : (
        <>
          <OptionStepper
            label="Głębokość"
            name={`${shelfPath}.depth`}
            options={shelfDepthOptions}
          />
          <CountStepper
            label="Liczba półek"
            min={1}
            name={`${shelfPath}.numberOfShelves`}
            onRemove={handleRemove}
          />
        </>
      )}

      <Button
        className="self-start"
        disabled={shelfDepthOptions.length === 0}
        onClick={handleAppend}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Plus className="h-3 w-3" />
        Dodaj półki
      </Button>
    </div>
  )
}
