import { Plus } from "lucide-react"
import { useFormContext, useWatch } from "react-hook-form"

import { OfferInput } from "@/schemas/Offer.schema"

import { CountStepper } from "./CountStepper"
import { OptionsFields } from "./OptionsFields"
import { OptionStepper } from "./OptionStepper"
import { SectionLabel } from "./SectionLabel"
import { SectionNavigator } from "./SectionNavigator"
import { ShelvesFields } from "./ShelvesFields"
import { Button } from "../../../core/ui/button"
import { useInventoryDimensions } from "../../hooks/useInventoryDimensions"
import { RunOptionsPath } from "../../offer.types"

export function ShelfUnitEditor({
  areGondolaSidesUnlinked,
  isSingleModule = false,
  layoutIndex,
  onDuplicateUnit,
  onRemoveUnit,
  onSelectShelf,
  onSelectUnit,
  optionsPath,
  selectedShelfIndex,
  topCoverPath,
  unitCount,
  unitIndex,
  unitsPath,
}: {
  areGondolaSidesUnlinked?: boolean
  isSingleModule?: boolean
  layoutIndex: number
  onDuplicateUnit?: () => void
  onRemoveUnit?: () => void
  onSelectShelf: (shelfIndex: number) => void
  onSelectUnit: (unitIndex: number) => void
  optionsPath: RunOptionsPath
  selectedShelfIndex: number
  topCoverPath?: RunOptionsPath
  unitCount: number
  unitIndex: number
  unitsPath: RunOptionsPath
}) {
  const { control } = useFormContext<OfferInput>()
  const { layoutDepths, layoutHeights, shelfDepths, shelfUnitWidths } =
    useInventoryDimensions()

  const unit = useWatch({
    control,
    name: `${unitsPath}.shelfUnits.${unitIndex}`,
  })

  if (!unit) return null

  const widthStepper = (
    <OptionStepper
      label="Szerokość"
      name={`${unitsPath}.shelfUnits.${unitIndex}.width`}
      options={shelfUnitWidths}
    />
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 rounded-lg border bg-background p-4">
        <SectionLabel>{isSingleModule ? "Regał" : "Ciąg"}</SectionLabel>
        <OptionStepper
          label="Głębokość bazy"
          name={`${unitsPath}.depth`}
          options={layoutDepths}
        />
        {isSingleModule ? (
          widthStepper
        ) : (
          <OptionStepper
            label="Wysokość"
            name={`layouts.${layoutIndex}.height`}
            options={layoutHeights}
          />
        )}
      </div>
      {!isSingleModule && (
        <div className="flex flex-col gap-2 rounded-lg border bg-background p-4">
          <div className="flex items-center justify-between gap-2">
            <SectionLabel>Regały</SectionLabel>
            <SectionNavigator
              count={unitCount}
              index={unitIndex}
              onSelect={onSelectUnit}
            />
          </div>
          {widthStepper}
          <CountStepper
            label="Liczba regałów"
            min={1}
            name={`${unitsPath}.shelfUnits.${unitIndex}.numberOfShelfUnits`}
            onRemove={onRemoveUnit}
          />
          <Button
            className="self-start"
            onClick={onDuplicateUnit}
            size="sm"
            type="button"
            variant="ghost"
          >
            <Plus className="h-3 w-3" />
            Dodaj regały
          </Button>
        </div>
      )}
      <ShelvesFields
        layoutIndex={layoutIndex}
        onSelectShelf={onSelectShelf}
        selectedShelfIndex={selectedShelfIndex}
        shelfDepthOptions={shelfDepths}
        unitIndex={unitIndex}
        unitsPath={unitsPath}
      />
      <OptionsFields
        areGondolaSidesUnlinked={areGondolaSidesUnlinked}
        layoutIndex={layoutIndex}
        optionsPath={optionsPath}
        topCoverPath={topCoverPath}
      />
    </div>
  )
}
