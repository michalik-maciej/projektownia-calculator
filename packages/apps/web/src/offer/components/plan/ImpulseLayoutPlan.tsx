import { useFieldArray, useFormContext, useWatch } from "react-hook-form"

import { IMPULSE_FRONT_DEPTH } from "@/schemas/LayoutImpulse.schema"
import { OfferInput, OfferOutput } from "@/schemas/Offer.schema"

import { LayoutPlanHeader } from "./LayoutPlanHeader"
import { SCALE_PX_PER_CM } from "./planScale"
import { planUnitClassName } from "./planUnitClassName"
import { ShelvesSummary } from "./ShelvesSummary"
import { formatLayoutCode } from "../../helpers/formatLayoutCode"
import { getLayoutName } from "../../helpers/getLayoutName"
import { isImpulseLayout } from "../../helpers/isImpulseLayout"
import { BreakdownList } from "../BreakdownList"
import { EditorPanel, PanelTab } from "../editor/EditorPanel"
import { ImpulseEditor } from "../editor/ImpulseEditor"

export function ImpulseLayoutPlan({
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
  preview: OfferOutput["layouts"][number] | undefined
  selectedShelfIndex: number
  selectedUnitIndex: number | null
}) {
  const { control, getValues } = useFormContext<OfferInput>()
  const layout = useWatch({ control, name: `layouts.${layoutIndex}` })
  const bays = useFieldArray({ control, name: `layouts.${layoutIndex}.bays` })

  if (!layout || !isImpulseLayout(layout)) return null

  const handleRemoveBay = (bayIndex: number) => {
    const wasLast = bayIndex === bays.fields.length - 1

    bays.remove(bayIndex)
    onSelectUnit(wasLast ? bayIndex - 1 : bayIndex)
  }

  const sides = [
    {
      depth: IMPULSE_FRONT_DEPTH,
      listShelves: (bayIndex: number) => [
        {
          depth: IMPULSE_FRONT_DEPTH,
          numberOfShelves: layout.bays[bayIndex]?.frontShelves ?? 0,
        },
      ],
    },
    {
      depth: layout.backDepth,
      listShelves: (bayIndex: number) =>
        layout.bays[bayIndex]?.backShelves ?? [],
    },
  ]

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
        <div className="flex w-max flex-col gap-2.5">
          <p className="font-mono text-xs text-muted-foreground">
            Strona klienta
          </p>
          <div className="flex flex-col gap-[3px]">
            {sides.map(({ depth, listShelves }, sideIndex) => (
              <div className="flex" key={sideIndex}>
                {bays.fields.map((bayField, bayIndex) => {
                  const bay = layout.bays[bayIndex]

                  if (!bay) return null

                  return (
                    <button
                      className={planUnitClassName(
                        selectedUnitIndex === bayIndex,
                      )}
                      key={bayField.id}
                      onClick={() => onSelectUnit(bayIndex)}
                      style={{
                        height: depth * SCALE_PX_PER_CM,
                        width: bay.width * SCALE_PX_PER_CM,
                      }}
                      type="button"
                    >
                      <span>{[bay.width, depth, bay.height].join("/")}</span>
                      <span className="text-muted-foreground">
                        <ShelvesSummary
                          highlightedIndex={null}
                          shelves={listShelves(bayIndex)}
                        />
                      </span>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            Strona sprzedawcy
          </p>
        </div>
      </div>

      {selectedUnitIndex !== null && layout.bays[selectedUnitIndex] && (
        <EditorPanel
          eyebrow={`${formatLayoutCode(layoutIndex, layout)} / regał ${selectedUnitIndex + 1}`}
          onSelectTab={onSelectTab}
          tab={panelTab}
          title={getLayoutName(layout)}
        >
          {panelTab === "edit" && (
            <ImpulseEditor
              bayCount={bays.fields.length}
              bayIndex={selectedUnitIndex}
              layoutIndex={layoutIndex}
              onDuplicateBay={() =>
                bays.insert(
                  selectedUnitIndex + 1,
                  structuredClone(
                    getValues(
                      `layouts.${layoutIndex}.bays.${selectedUnitIndex}`,
                    ),
                  ),
                )
              }
              {...(bays.fields.length > 1 && {
                onRemoveBay: () => handleRemoveBay(selectedUnitIndex),
              })}
              onSelectBay={onSelectUnit}
              onSelectShelf={onSelectShelf}
              selectedShelfIndex={selectedShelfIndex}
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
