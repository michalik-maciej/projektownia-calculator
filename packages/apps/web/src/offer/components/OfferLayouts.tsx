import { Plus } from "lucide-react"
import { useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"

import { OfferInput, OfferOutput } from "@/schemas/Offer.schema"

import { EditorPanel, PanelTab } from "./editor/EditorPanel"
import { GondolaLayoutPlan } from "./plan/GondolaLayoutPlan"
import { ItemSetPlan } from "./plan/ItemSetPlan"
import { WallLayoutPlan } from "./plan/WallLayoutPlan"
import { Button } from "../../core/ui/button"
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
    <section className="flex flex-col gap-8 px-8 pb-16 mr-90">
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

      <div className="flex flex-col items-start gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            disabled={!defaultWallLayout}
            onClick={() => defaultWallLayout && append(defaultWallLayout)}
            type="button"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            Dodaj ciąg przyścienny
          </Button>
          <Button
            disabled={!defaultGondolaLayout}
            onClick={() => defaultGondolaLayout && append(defaultGondolaLayout)}
            type="button"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            Dodaj gondolę
          </Button>
          <Button
            onClick={() => append({ items: [] })}
            type="button"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            Dodaj zestaw elementów
          </Button>
        </div>
        {!defaultWallLayout && (
          <p className="text-xs text-muted-foreground">
            Uzupełnij magazyn komponentów, żeby móc dodać ciąg.
          </p>
        )}
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
