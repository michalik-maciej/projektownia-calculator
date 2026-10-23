import { useFieldArray, useFormContext, useWatch } from "react-hook-form"

import { OfferInput, OfferOutput } from "@/schemas/Offer.schema"

import { LayoutPlanHeader } from "./LayoutPlanHeader"
import { SCALE_PX_PER_CM } from "./planScale"
import { planUnitClassName } from "./planUnitClassName"
import { ShelvesSummary } from "./ShelvesSummary"
import { formatLayoutCode } from "../../helpers/formatLayoutCode"
import { getLayoutName } from "../../helpers/getLayoutName"
import { isGondolaLayout } from "../../helpers/isGondolaLayout"
import { isImpulseLayout } from "../../helpers/isImpulseLayout"
import { isItemSetLayout } from "../../helpers/isItemSetLayout"
import { BreakdownList } from "../BreakdownList"
import { EditorPanel, PanelTab } from "../editor/EditorPanel"
import { ShelfUnitEditor } from "../editor/ShelfUnitEditor"

type LayoutPreview = OfferOutput["layouts"][number]

export function WallLayoutPlan({
  layoutIndex,
  onDuplicate,
  onRemove,
  onSelectShelf,
  onSelectTab,
  onSelectUnit,
  panelTab,
  preview,
  selectedShelfIndex,
  selectedUnitIndex,
}: {
  layoutIndex: number
  onDuplicate: () => void
  onRemove: () => void
  onSelectShelf: (shelfIndex: number) => void
  onSelectTab: (tab: PanelTab) => void
  onSelectUnit: (unitIndex: number | null) => void
  panelTab: PanelTab
  preview: LayoutPreview | undefined
  selectedShelfIndex: number
  selectedUnitIndex: number | null
}) {
  const { control, getValues } = useFormContext<OfferInput>()
  const layout = useWatch({ control, name: `layouts.${layoutIndex}` })

  const shelfUnits = useFieldArray({
    control,
    name: `layouts.${layoutIndex}.shelfUnits`,
  })

  const canRemoveUnit = shelfUnits.fields.length > 1
  const selectedUnit =
    selectedUnitIndex === null ? null : shelfUnits.fields[selectedUnitIndex]

  const handleDuplicateUnit = (unitIndex: number) =>
    shelfUnits.insert(
      unitIndex + 1,
      structuredClone(
        getValues(`layouts.${layoutIndex}.shelfUnits.${unitIndex}`),
      ),
    )

  const handleRemoveUnit = (unitIndex: number) => {
    const wasLast = unitIndex === shelfUnits.fields.length - 1

    shelfUnits.remove(unitIndex)
    onSelectUnit(wasLast ? unitIndex - 1 : unitIndex)
  }

  if (
    !layout ||
    isGondolaLayout(layout) ||
    isImpulseLayout(layout) ||
    isItemSetLayout(layout)
  ) {
    return null
  }

  return (
    <article className="flex flex-col gap-3">
      <LayoutPlanHeader
        isSelected={selectedUnitIndex !== null}
        layoutIndex={layoutIndex}
        onDuplicate={onDuplicate}
        onRemove={onRemove}
        preview={preview}
      />

      <div className="overflow-x-auto pb-2">
        <div className="flex w-max">
          {shelfUnits.fields.map((unitField, unitIndex) => {
            const unit = layout.shelfUnits[unitIndex]

            if (!unit) return null

            return Array.from(
              { length: Math.max(unit.numberOfShelfUnits, 0) },
              (_, copyIndex) => (
                <button
                  className={planUnitClassName(selectedUnitIndex === unitIndex)}
                  key={`${unitField.id}-${copyIndex}`}
                  onClick={() => onSelectUnit(unitIndex)}
                  style={{
                    height: layout.depth * SCALE_PX_PER_CM,
                    width: unit.width * SCALE_PX_PER_CM,
                  }}
                  type="button"
                >
                  <span>
                    {[unit.width, layout.depth, layout.height].join("/")}
                  </span>
                  <span className="text-muted-foreground">
                    <ShelvesSummary
                      highlightedIndex={
                        selectedUnitIndex === unitIndex
                          ? selectedShelfIndex
                          : null
                      }
                      shelves={unit.shelves}
                    />
                  </span>
                </button>
              ),
            )
          })}
        </div>
      </div>

      {selectedUnitIndex !== null && selectedUnit && (
        <EditorPanel
          onSelectTab={onSelectTab}
          eyebrow={`${formatLayoutCode(layoutIndex, layout)} / regał ${selectedUnitIndex + 1}`}
          tab={panelTab}
          title={getLayoutName(layout)}
        >
          {panelTab === "edit" && (
            <ShelfUnitEditor
              key={selectedUnit.id}
              layoutIndex={layoutIndex}
              onDuplicateUnit={() => handleDuplicateUnit(selectedUnitIndex)}
              {...(canRemoveUnit && {
                onRemoveUnit: () => handleRemoveUnit(selectedUnitIndex),
              })}
              onSelectShelf={onSelectShelf}
              onSelectUnit={onSelectUnit}
              optionsPath={`layouts.${layoutIndex}`}
              selectedShelfIndex={selectedShelfIndex}
              unitCount={shelfUnits.fields.length}
              unitIndex={selectedUnitIndex}
              unitsPath={`layouts.${layoutIndex}`}
            />
          )}
          {panelTab === "breakdown" && (
            <BreakdownList breakdown={preview?.breakdown} />
          )}
        </EditorPanel>
      )}
    </article>
  )
}
