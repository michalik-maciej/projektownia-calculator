import { Plus, Trash2 } from "lucide-react"
import { useEffect } from "react"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"

import { GondolaSide } from "@/schemas/LayoutGondola.schema"
import { OfferInput, OfferOutput } from "@/schemas/Offer.schema"

import { LayoutPlanHeader } from "./LayoutPlanHeader"
import { SCALE_PX_PER_CM } from "./planScale"
import { ShelvesSummary } from "./ShelvesSummary"
import { Button } from "../../../core/ui/button"
import { createDefaultEndCap } from "../../helpers/createDefaultEndCap"
import { isGondolaLayout } from "../../helpers/isGondolaLayout"
import { useInventoryDimensions } from "../../hooks/useInventoryDimensions"
import { LayoutPart } from "../../offer.types"
import { BreakdownList } from "../BreakdownList"
import { EditorPanel, PanelTab } from "../editor/EditorPanel"
import { ShelfUnitEditor } from "../editor/ShelfUnitEditor"

type LayoutPreview = OfferOutput["layouts"][number]
const END_CAP_UNIT_INDEX = 0
const END_CAP_UNIT_COUNT = 1

const END_CAP_LABELS: Record<Exclude<LayoutPart, "middle">, string> = {
  leftEndCap: "Szczyt lewy",
  rightEndCap: "Szczyt prawy",
}

export function GondolaLayoutPlan({
  layoutIndex,
  onDuplicate,
  onRemove,
  onSelectShelf,
  onSelectTab,
  onSelectUnit,
  panelTab,
  preview,
  selectedPart,
  selectedShelfIndex,
  selectedUnitIndex,
}: {
  layoutIndex: number
  onDuplicate: () => void
  onRemove: () => void
  onSelectShelf: (shelfIndex: number) => void
  onSelectTab: (tab: PanelTab) => void
  onSelectUnit: (unitIndex: number | null, part?: LayoutPart) => void
  panelTab: PanelTab
  preview: LayoutPreview | undefined
  selectedPart: LayoutPart
  selectedShelfIndex: number
  selectedUnitIndex: number | null
}) {
  const { control, getValues, setValue } = useFormContext<OfferInput>()
  const layout = useWatch({ control, name: `layouts.${layoutIndex}` })
  const dimensions = useInventoryDimensions()
  const defaultEndCap = createDefaultEndCap(dimensions)

  const middlePath = `layouts.${layoutIndex}.sides.0` as const
  const mirroredSidePath = `layouts.${layoutIndex}.sides.1` as const
  const middleSide = useWatch({ control, name: middlePath })

  useEffect(() => {
    if (!middleSide) return

    const mirroredSide = getValues(mirroredSidePath)

    if (JSON.stringify(mirroredSide) !== JSON.stringify(middleSide)) {
      setValue(mirroredSidePath, structuredClone(middleSide))
    }
  }, [getValues, middleSide, mirroredSidePath, setValue])

  const shelfUnits = useFieldArray({
    control,
    name: `${middlePath}.shelfUnits`,
  })

  const canRemoveUnit = shelfUnits.fields.length > 1
  const selectedMiddleUnit =
    selectedPart === "middle" && selectedUnitIndex !== null
      ? shelfUnits.fields[selectedUnitIndex]
      : null

  const handleDuplicateUnit = (unitIndex: number) =>
    shelfUnits.insert(
      unitIndex + 1,
      structuredClone(getValues(`${middlePath}.shelfUnits.${unitIndex}`)),
    )

  const handleRemoveUnit = (unitIndex: number) => {
    const wasLast = unitIndex === shelfUnits.fields.length - 1

    shelfUnits.remove(unitIndex)
    onSelectUnit(wasLast ? unitIndex - 1 : unitIndex)
  }

  const handleAddEndCap = (part: Exclude<LayoutPart, "middle">) => {
    if (!defaultEndCap) return

    setValue(`layouts.${layoutIndex}.${part}`, defaultEndCap, {
      shouldDirty: true,
    })
    onSelectUnit(END_CAP_UNIT_INDEX, part)
  }

  const handleRemoveEndCap = (part: Exclude<LayoutPart, "middle">) => {
    setValue(`layouts.${layoutIndex}.${part}`, undefined, {
      shouldDirty: true,
    })
    onSelectUnit(null)
  }

  if (!layout || !isGondolaLayout(layout)) return null

  const gondolaDepth = layout.sides.reduce((sum, { depth }) => sum + depth, 0)

  const selectedEndCapPart = selectedPart === "middle" ? null : selectedPart
  const selectedEndCap = selectedEndCapPart
    ? layout[selectedEndCapPart]
    : undefined

  const renderSide = (side: GondolaSide, sideIndex: number) => (
    <div className="flex w-max border border-foreground/40">
      {shelfUnits.fields.map((unitField, unitIndex) => {
        const unit = side.shelfUnits[unitIndex]

        if (!unit) return null

        const isSelected =
          selectedPart === "middle" && selectedUnitIndex === unitIndex

        return Array.from(
          { length: Math.max(unit.numberOfShelfUnits, 0) },
          (_, copyIndex) => (
            <button
              className={`flex shrink-0 flex-col items-center justify-center gap-1 border border-border text-xs tabular-nums transition-colors hover:bg-accent ${
                isSelected ? "border-primary bg-accent" : ""
              }`}
              key={`${unitField.id}-${copyIndex}-${sideIndex}`}
              onClick={() => onSelectUnit(unitIndex, "middle")}
              style={{
                height: side.depth * SCALE_PX_PER_CM,
                width: unit.width * SCALE_PX_PER_CM,
              }}
              type="button"
            >
              <span>{[unit.width, side.depth, layout.height].join("/")}</span>
              <span className="text-muted-foreground">
                <ShelvesSummary
                  highlightedIndex={isSelected ? selectedShelfIndex : null}
                  shelves={unit.shelves}
                />
              </span>
            </button>
          ),
        )
      })}
    </div>
  )

  const renderEndCapSlot = (part: Exclude<LayoutPart, "middle">) => {
    const endCap = layout[part]
    const unit = endCap?.shelfUnits[END_CAP_UNIT_INDEX]

    if (!endCap || !unit) {
      return (
        <button
          aria-label={`Dodaj ${END_CAP_LABELS[part].toLowerCase()}`}
          className="flex w-10 shrink-0 items-center justify-center rounded-md border border-dashed border-foreground/40 text-muted-foreground transition-colors hover:bg-accent disabled:opacity-50"
          disabled={!defaultEndCap}
          onClick={() => handleAddEndCap(part)}
          style={{
            height: gondolaDepth * SCALE_PX_PER_CM,
          }}
          type="button"
        >
          <Plus className="h-4 w-4" />
        </button>
      )
    }

    const isSelected = selectedPart === part

    return (
      <div className="border border-foreground/40">
        <button
          className={`flex shrink-0 flex-col items-center justify-center gap-1 border border-border text-xs tabular-nums transition-colors hover:bg-accent ${
            isSelected ? "border-primary bg-accent" : ""
          }`}
          onClick={() => onSelectUnit(END_CAP_UNIT_INDEX, part)}
          style={{
            height: unit.width * SCALE_PX_PER_CM,
            width: endCap.depth * SCALE_PX_PER_CM,
          }}
          type="button"
        >
          <span>{[unit.width, endCap.depth, layout.height].join("/")}</span>
          <span className="text-muted-foreground">
            <ShelvesSummary
              highlightedIndex={isSelected ? selectedShelfIndex : null}
              shelves={unit.shelves}
            />
          </span>
        </button>
      </div>
    )
  }

  return (
    <article className="flex flex-col gap-3">
      <LayoutPlanHeader
        layoutIndex={layoutIndex}
        onDuplicate={onDuplicate}
        onRemove={onRemove}
        preview={preview}
      />

      <div className="overflow-x-auto pb-2">
        <div className="w-max">
          <p className="mb-1.5 text-xs text-muted-foreground">Strona 1</p>
          <div className="flex items-center gap-[3px]">
            {renderEndCapSlot("leftEndCap")}
            <div className="flex flex-col gap-[3px]">
              {layout.sides.map((side, sideIndex) => (
                <div key={sideIndex}>{renderSide(side, sideIndex)}</div>
              ))}
            </div>
            {renderEndCapSlot("rightEndCap")}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">Strona 2</p>
        </div>
      </div>

      {(selectedMiddleUnit || selectedEndCap) && (
        <EditorPanel
          onSelectTab={onSelectTab}
          tab={panelTab}
          title={`Ciąg ${layoutIndex + 1}`}
        >
          {panelTab === "edit" &&
            selectedMiddleUnit &&
            selectedUnitIndex !== null && (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  Zmiany dotyczą obu stron gondoli.
                </p>
                <ShelfUnitEditor
                  key={selectedMiddleUnit.id}
                  layoutIndex={layoutIndex}
                  onDuplicateUnit={() => handleDuplicateUnit(selectedUnitIndex)}
                  {...(canRemoveUnit && {
                    onRemoveUnit: () => handleRemoveUnit(selectedUnitIndex),
                  })}
                  onSelectShelf={onSelectShelf}
                  onSelectUnit={onSelectUnit}
                  optionsPath={middlePath}
                  selectedShelfIndex={selectedShelfIndex}
                  unitCount={shelfUnits.fields.length}
                  unitIndex={selectedUnitIndex}
                  unitsPath={middlePath}
                />
              </>
            )}
          {panelTab === "edit" && selectedEndCapPart && selectedEndCap && (
            <>
              <div className="mb-4 flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">
                  {END_CAP_LABELS[selectedEndCapPart]}
                </p>
                <Button
                  className="shrink-0 text-destructive hover:text-destructive"
                  onClick={() => handleRemoveEndCap(selectedEndCapPart)}
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="h-3 w-3" />
                  Usuń szczyt
                </Button>
              </div>
              <ShelfUnitEditor
                key={selectedEndCapPart}
                isSingleModule
                layoutIndex={layoutIndex}
                onSelectShelf={onSelectShelf}
                onSelectUnit={(unitIndex) =>
                  onSelectUnit(unitIndex, selectedEndCapPart)
                }
                optionsPath={`layouts.${layoutIndex}.${selectedEndCapPart}`}
                selectedShelfIndex={selectedShelfIndex}
                unitCount={END_CAP_UNIT_COUNT}
                unitIndex={END_CAP_UNIT_INDEX}
                unitsPath={`layouts.${layoutIndex}.${selectedEndCapPart}`}
              />
            </>
          )}
          {panelTab === "breakdown" && (
            <BreakdownList breakdown={preview?.breakdown} />
          )}
        </EditorPanel>
      )}
    </article>
  )
}
