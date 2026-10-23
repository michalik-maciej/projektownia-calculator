import { Plus } from "lucide-react"
import { useFormContext, useWatch } from "react-hook-form"

import {
  IMPULSE_BACK_DEPTHS,
  IMPULSE_HIGH_HEIGHT,
  IMPULSE_LOW_HEIGHT,
} from "@/schemas/LayoutImpulse.schema"
import { OfferInput } from "@/schemas/Offer.schema"

import { ChoiceField } from "./ChoiceField"
import { ComponentQuantityFields } from "./ComponentQuantityFields"
import { CountStepper } from "./CountStepper"
import { OptionStepper } from "./OptionStepper"
import { SectionLabel } from "./SectionLabel"
import { SectionNavigator } from "./SectionNavigator"
import { ShelvesFields } from "./ShelvesFields"
import { Button } from "../../../core/ui/button"
import { createDefaultImpulseShelves } from "../../helpers/createDefaultImpulseLayout"
import { isImpulseLayout } from "../../helpers/isImpulseLayout"
import { useInventoryDimensions } from "../../hooks/useInventoryDimensions"

const SIDE_OPTIONS = {
  back: [
    { label: "Brak", value: 0 },
    { label: "Tył", value: 1 },
    { label: "Obie", value: 2 },
  ],
  baseCover: [
    { label: "Brak", value: 0 },
    { label: "Front", value: 1 },
    { label: "Obie", value: 2 },
  ],
} as const

export function ImpulseEditor({
  bayCount,
  bayIndex,
  layoutIndex,
  onDuplicateBay,
  onRemoveBay,
  onSelectBay,
  onSelectShelf,
  selectedShelfIndex,
}: {
  bayCount: number
  bayIndex: number
  layoutIndex: number
  onDuplicateBay: () => void
  onRemoveBay?: () => void
  onSelectBay: (bayIndex: number) => void
  onSelectShelf: (shelfIndex: number) => void
  selectedShelfIndex: number
}) {
  const { control, setValue } = useFormContext<OfferInput>()
  const { shelfDepths, shelfUnitWidths } = useInventoryDimensions()
  const layoutPath = `layouts.${layoutIndex}` as const
  const bayPath = `${layoutPath}.bays.${bayIndex}` as const
  const layout = useWatch({ control, name: layoutPath })
  const bay = layout && isImpulseLayout(layout) && layout.bays[bayIndex]

  if (!bay) return null

  const { backDepth, backVariant, baseCoverVariant } = layout

  const setOption = <Name extends Parameters<typeof setValue>[0]>(
    name: Name,
    value: Parameters<typeof setValue<Name>>[1],
  ) => setValue(name, value, { shouldDirty: true })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-4">
        <SectionLabel>Ciąg</SectionLabel>
        <ChoiceField
          label="Baza tyłu"
          onChange={(depth) => setOption(`${layoutPath}.backDepth`, depth)}
          options={IMPULSE_BACK_DEPTHS.map((depth) => ({
            label: String(depth),
            value: depth,
          }))}
          value={backDepth}
        />
        <ChoiceField
          label="Plecy"
          onChange={(variant) =>
            setOption(`${layoutPath}.backVariant`, variant)
          }
          options={[...SIDE_OPTIONS.back]}
          value={backVariant}
        />
        <ChoiceField
          label="Osłona dolna"
          onChange={(variant) =>
            setOption(`${layoutPath}.baseCoverVariant`, variant)
          }
          options={[...SIDE_OPTIONS.baseCover]}
          value={baseCoverVariant}
        />
      </div>

      <div className="flex flex-col gap-2 rounded-lg border bg-background p-4">
        <div className="flex items-center justify-between gap-2">
          <SectionLabel>Regał</SectionLabel>
          <SectionNavigator
            count={bayCount}
            index={bayIndex}
            onSelect={onSelectBay}
          />
        </div>
        <OptionStepper
          label="Szerokość"
          name={`${bayPath}.width`}
          options={shelfUnitWidths}
        />
        <ChoiceField
          label="Wysokość"
          onChange={(height) =>
            setOption(bayPath, {
              ...bay,
              ...createDefaultImpulseShelves(height, backDepth),
              height,
            })
          }
          options={[
            { label: "Niski 90", value: IMPULSE_LOW_HEIGHT },
            { label: "Wysoki 130", value: IMPULSE_HIGH_HEIGHT },
          ]}
          value={bay.height}
        />
        <div className="flex gap-1">
          <Button
            onClick={onDuplicateBay}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Plus className="h-3 w-3" />
            Dodaj regał
          </Button>
          {onRemoveBay && (
            <Button
              className="text-destructive hover:text-destructive"
              onClick={onRemoveBay}
              size="sm"
              type="button"
              variant="ghost"
            >
              Usuń regał
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border bg-background p-4">
        <SectionLabel>Półki od frontu</SectionLabel>
        <CountStepper
          label="Liczba półek"
          min={0}
          name={`${bayPath}.frontShelves`}
        />
      </div>

      <ShelvesFields
        key={bayPath}
        label="Półki od tyłu"
        newShelfCount={1}
        onSelectShelf={onSelectShelf}
        selectedShelfIndex={selectedShelfIndex}
        shelfDepthOptions={shelfDepths.filter((depth) => depth <= backDepth)}
        shelvesPath={`${bayPath}.backShelves`}
      />

      <div className="flex flex-col gap-2 rounded-lg border bg-background p-4">
        <SectionLabel>Opcje</SectionLabel>
        <ComponentQuantityFields
          label="Inne elementy"
          name={`${layoutPath}.extras`}
        />
      </div>
    </div>
  )
}
