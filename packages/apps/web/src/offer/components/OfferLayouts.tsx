import { useId, useState } from "react"
import { Controller, useFieldArray, useFormContext } from "react-hook-form"

import { OfferInput, OfferOutput } from "@/schemas/Offer.schema"

import { EditorPanel, PanelTab } from "./editor/EditorPanel"
import { AddLayoutSlot } from "./plan/AddLayoutSlot"
import { GondolaLayoutPlan } from "./plan/GondolaLayoutPlan"
import { ItemSetPlan } from "./plan/ItemSetPlan"
import { WallLayoutPlan } from "./plan/WallLayoutPlan"
import { Checkbox } from "../../core/ui/checkbox"
import { Label } from "../../core/ui/label"
import { createDefaultGondolaLayout } from "../helpers/createDefaultGondolaLayout"
import { createDefaultWallLayout } from "../helpers/createDefaultWallLayout"
import { isGondolaLayout } from "../helpers/isGondolaLayout"
import { isItemSetLayout } from "../helpers/isItemSetLayout"
import { useInventoryDimensions } from "../hooks/useInventoryDimensions"
import { LayoutPart } from "../offer.types"

type SelectedUnit = {
  layoutIndex: number
  part: LayoutPart
  unitIndex: number
}

export function OfferLayouts({ output }: { output: OfferOutput | undefined }) {
  const { control, getValues } = useFormContext<OfferInput>()
  const { append, fields, insert, remove } = useFieldArray({
    control,
    name: "layouts",
  })
  const [selectedUnit, setSelectedUnit] = useState<SelectedUnit | null>(null)
  const [selectedShelfIndex, setSelectedShelfIndex] = useState(0)
  const [panelTab, setPanelTab] = useState<PanelTab>("edit")
  const priceStripsId = useId()

  const dimensions = useInventoryDimensions()
  const defaultWallLayout = createDefaultWallLayout(dimensions)
  const defaultGondolaLayout = createDefaultGondolaLayout(dimensions)

  const selectUnit = (
    layoutIndex: number,
    unitIndex: number | null,
    part: LayoutPart = "middle",
  ) => {
    setSelectedUnit(
      unitIndex === null ? null : { layoutIndex, part, unitIndex },
    )
    setSelectedShelfIndex(0)
  }

  return (
    <section className="mr-96 flex flex-col gap-10 bg-plan-grid px-8 pt-6 pb-16">
      {fields.map((field, index) => {
        const layout = getValues(`layouts.${index}`)
        const isSelectedLayout = selectedUnit?.layoutIndex === index
        const planProps = {
          layoutIndex: index,
          onDuplicate: () => {
            insert(index + 1, structuredClone(getValues(`layouts.${index}`)))
            setSelectedUnit(null)
          },
          onRemove: () => {
            remove(index)
            setSelectedUnit(null)
          },
          onSelectShelf: setSelectedShelfIndex,
          onSelectTab: setPanelTab,
          panelTab,
          preview: output?.layouts[index],
          selectedShelfIndex,
          selectedUnitIndex: isSelectedLayout ? selectedUnit.unitIndex : null,
        }

        if (layout && isItemSetLayout(layout)) {
          return (
            <ItemSetPlan
              isSelected={isSelectedLayout}
              key={field.id}
              layoutIndex={index}
              onDuplicate={planProps.onDuplicate}
              onRemove={planProps.onRemove}
              onSelect={() => selectUnit(index, 0)}
              onSelectTab={setPanelTab}
              panelTab={panelTab}
              preview={planProps.preview}
            />
          )
        }

        return layout && isGondolaLayout(layout) ? (
          <GondolaLayoutPlan
            key={field.id}
            {...planProps}
            onSelectUnit={(unitIndex, part) =>
              selectUnit(index, unitIndex, part)
            }
            selectedPart={isSelectedLayout ? selectedUnit.part : "middle"}
          />
        ) : (
          <WallLayoutPlan
            key={field.id}
            {...planProps}
            onSelectUnit={(unitIndex) => selectUnit(index, unitIndex)}
          />
        )
      })}

      <div className="flex flex-col gap-3">
        <AddLayoutSlot
          onAddGondola={
            defaultGondolaLayout && (() => append(defaultGondolaLayout))
          }
          onAddItemSet={() => append({ items: [] })}
          onAddWall={defaultWallLayout && (() => append(defaultWallLayout))}
        />
        <div className="flex items-center gap-1.5">
          <Controller
            control={control}
            name="hasPriceStrips"
            render={({ field }) => (
              <Checkbox
                checked={field.value ?? true}
                id={priceStripsId}
                onBlur={field.onBlur}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label
            className="cursor-pointer font-normal text-muted-foreground"
            htmlFor={priceStripsId}
          >
            Listwy cenowe do wszystkich półek
          </Label>
        </div>
      </div>

      {!selectedUnit && (
        <EditorPanel title="Edycja">
          <p className="text-sm text-muted-foreground">
            Kliknij regał na planie, żeby edytować jego wymiary i półki.
          </p>
        </EditorPanel>
      )}
    </section>
  )
}
