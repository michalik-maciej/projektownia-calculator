import { Link, Plus, Trash2, TriangleAlert, Unlink } from "lucide-react"
import { useEffect, useState } from "react"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"

import { GondolaSide } from "@/schemas/LayoutGondola.schema"
import { OfferInput, OfferOutput } from "@/schemas/Offer.schema"

import { LayoutPlanHeader } from "./LayoutPlanHeader"
import { SCALE_PX_PER_CM } from "./planScale"
import { ShelvesSummary } from "./ShelvesSummary"
import { Button } from "../../../core/ui/button"
import { ConfirmDialog } from "../../../core/ui/confirm-dialog"
import { areGondolaSidesEqual } from "../../helpers/areGondolaSidesEqual"
import { createDefaultEndCap } from "../../helpers/createDefaultEndCap"
import { haveDifferentUnitLayouts } from "../../helpers/haveDifferentUnitLayouts"
import { isGondolaLayout } from "../../helpers/isGondolaLayout"
import { useInventoryDimensions } from "../../hooks/useInventoryDimensions"
import { EndCapPart, LayoutPart } from "../../offer.types"
import { BreakdownList } from "../BreakdownList"
import { EditorPanel, PanelTab } from "../editor/EditorPanel"
import { ShelfUnitEditor } from "../editor/ShelfUnitEditor"

type LayoutPreview = OfferOutput["layouts"][number]
const END_CAP_UNIT_INDEX = 0
const END_CAP_UNIT_COUNT = 1

type SidePart = Extract<LayoutPart, "middle" | "secondSide">

const END_CAP_LABELS: Record<EndCapPart, string> = {
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

  const firstSidePath = `layouts.${layoutIndex}.sides.0` as const
  const secondSidePath = `layouts.${layoutIndex}.sides.1` as const
  const [areSidesLinked, setAreSidesLinked] = useState(() =>
    areGondolaSidesEqual(getValues(`layouts.${layoutIndex}.sides`)),
  )
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const firstSide = useWatch({ control, name: firstSidePath })

  const firstSideUnits = useFieldArray({
    control,
    name: `${firstSidePath}.shelfUnits`,
  })
  const secondSideUnits = useFieldArray({
    control,
    name: `${secondSidePath}.shelfUnits`,
  })
  const { replace: replaceSecondSideUnits } = secondSideUnits

  useEffect(() => {
    if (!areSidesLinked || !firstSide) return

    const secondSide = getValues(secondSidePath)

    if (JSON.stringify(secondSide) === JSON.stringify(firstSide)) return

    const mirroredSide = structuredClone(firstSide)

    setValue(secondSidePath, mirroredSide, { shouldDirty: true })
    replaceSecondSideUnits(mirroredSide.shelfUnits)
  }, [
    areSidesLinked,
    firstSide,
    getValues,
    replaceSecondSideUnits,
    secondSidePath,
    setValue,
  ])

  const isSecondSideSelected = selectedPart === "secondSide"
  const editedSideLabel = isSecondSideSelected
    ? "Edytujesz stronę 2."
    : "Edytujesz stronę 1."
  const editedSidePart: SidePart = isSecondSideSelected
    ? "secondSide"
    : "middle"
  const editedSidePath = isSecondSideSelected ? secondSidePath : firstSidePath
  const editedUnits = isSecondSideSelected ? secondSideUnits : firstSideUnits
  const canRemoveUnit = editedUnits.fields.length > 1
  const selectedSideUnit =
    (selectedPart === "middle" || isSecondSideSelected) &&
    selectedUnitIndex !== null
      ? editedUnits.fields[selectedUnitIndex]
      : null

  const handleDuplicateUnit = (unitIndex: number) =>
    editedUnits.insert(
      unitIndex + 1,
      structuredClone(getValues(`${editedSidePath}.shelfUnits.${unitIndex}`)),
    )

  const handleRemoveUnit = (unitIndex: number) => {
    const wasLast = unitIndex === editedUnits.fields.length - 1

    editedUnits.remove(unitIndex)
    onSelectUnit(wasLast ? unitIndex - 1 : unitIndex, editedSidePart)
  }

  const handleLinkSides = () => {
    setAreSidesLinked(true)
    setIsLinkDialogOpen(false)

    if (isSecondSideSelected) onSelectUnit(0, "middle")
  }

  const handleAddEndCap = (part: EndCapPart) => {
    if (!defaultEndCap) return

    setValue(`layouts.${layoutIndex}.${part}`, defaultEndCap, {
      shouldDirty: true,
    })
    onSelectUnit(END_CAP_UNIT_INDEX, part)
  }

  const handleRemoveEndCap = (part: EndCapPart) => {
    setValue(`layouts.${layoutIndex}.${part}`, undefined, {
      shouldDirty: true,
    })
    onSelectUnit(null)
  }

  if (!layout || !isGondolaLayout(layout)) return null

  const gondolaDepth = layout.sides.reduce((sum, { depth }) => sum + depth, 0)

  const selectedEndCapPart =
    selectedPart === "leftEndCap" || selectedPart === "rightEndCap"
      ? selectedPart
      : null
  const selectedEndCap = selectedEndCapPart
    ? layout[selectedEndCapPart]
    : undefined

  const sides = [
    { fields: firstSideUnits.fields, part: "middle", side: layout.sides[0] },
    {
      fields: secondSideUnits.fields,
      part: areSidesLinked ? "middle" : "secondSide",
      side: layout.sides[1],
    },
  ] satisfies {
    fields: typeof firstSideUnits.fields
    part: SidePart
    side: GondolaSide
  }[]

  const renderSide = ({ fields, part, side }: (typeof sides)[number]) => (
    <div className="flex w-max border border-foreground/40">
      {fields.map((unitField, unitIndex) => {
        const unit = side.shelfUnits[unitIndex]

        if (!unit) return null

        const isSelected =
          selectedPart === part && selectedUnitIndex === unitIndex

        return Array.from(
          { length: Math.max(unit.numberOfShelfUnits, 0) },
          (_, copyIndex) => (
            <button
              className={`flex shrink-0 flex-col items-center justify-center gap-1 border border-border text-xs tabular-nums transition-colors hover:bg-accent ${
                isSelected ? "border-primary bg-accent" : ""
              }`}
              key={`${unitField.id}-${copyIndex}`}
              onClick={() => onSelectUnit(unitIndex, part)}
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

  const renderEndCapSlot = (part: EndCapPart) => {
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
              {sides.map((side, sideIndex) => (
                <div key={sideIndex}>{renderSide(side)}</div>
              ))}
            </div>
            {renderEndCapSlot("rightEndCap")}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">Strona 2</p>
        </div>
      </div>

      {haveDifferentUnitLayouts(layout.sides) && (
        <p
          className="flex gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
          role="status"
        >
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          Strony mają różny układ regałów. Sprawdź liczbę nóg i dostosuj je w
          sekcji "Opcje &gt; Inne elementy".
        </p>
      )}

      {(selectedSideUnit || selectedEndCap) && (
        <EditorPanel
          onSelectTab={onSelectTab}
          tab={panelTab}
          title={`Ciąg ${layoutIndex + 1}`}
        >
          {panelTab === "edit" &&
            selectedSideUnit &&
            selectedUnitIndex !== null && (
              <>
                <div className="mb-4 flex items-center justify-between gap-2">
                  <p className="text-sm text-muted-foreground">
                    {areSidesLinked
                      ? "Zmiany dotyczą obu stron gondoli."
                      : editedSideLabel}
                  </p>
                  {areSidesLinked ? (
                    <Button
                      className="shrink-0"
                      onClick={() => setAreSidesLinked(false)}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      <Unlink className="h-3 w-3" />
                      Rozłącz gondolę
                    </Button>
                  ) : (
                    <Button
                      className="shrink-0"
                      onClick={() => setIsLinkDialogOpen(true)}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      <Link className="h-3 w-3" />
                      Połącz strony
                    </Button>
                  )}
                </div>
                <ShelfUnitEditor
                  key={selectedSideUnit.id}
                  layoutIndex={layoutIndex}
                  onDuplicateUnit={() => handleDuplicateUnit(selectedUnitIndex)}
                  {...(canRemoveUnit && {
                    onRemoveUnit: () => handleRemoveUnit(selectedUnitIndex),
                  })}
                  onSelectShelf={onSelectShelf}
                  onSelectUnit={(unitIndex) =>
                    onSelectUnit(unitIndex, editedSidePart)
                  }
                  optionsPath={editedSidePath}
                  selectedShelfIndex={selectedShelfIndex}
                  unitCount={editedUnits.fields.length}
                  unitIndex={selectedUnitIndex}
                  unitsPath={editedSidePath}
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

      <ConfirmDialog
        confirmLabel="Połącz strony"
        description="Strona 2 zostanie zastąpiona kopią strony 1, a dalsze zmiany będą dotyczyć obu stron."
        onConfirm={handleLinkSides}
        onOpenChange={setIsLinkDialogOpen}
        open={isLinkDialogOpen}
        title="Połączyć strony gondoli?"
      />
    </article>
  )
}
