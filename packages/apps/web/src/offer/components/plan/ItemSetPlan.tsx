import { useFormContext, useWatch } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { OfferInput, OfferOutput } from "@/schemas/Offer.schema"

import { LayoutPlanHeader } from "./LayoutPlanHeader"
import { inventoryQueries } from "../../../inventory/inventory.api"
import { isItemSetLayout } from "../../helpers/isItemSetLayout"
import { BreakdownList } from "../BreakdownList"
import { ComponentQuantityFields } from "../editor/ComponentQuantityFields"
import { EditorPanel, PanelTab } from "../editor/EditorPanel"

export function ItemSetPlan({
  isSelected,
  layoutIndex,
  onDuplicate,
  onRemove,
  onSelect,
  onSelectTab,
  panelTab,
  preview,
}: {
  isSelected: boolean
  layoutIndex: number
  onDuplicate: () => void
  onRemove: () => void
  onSelect: () => void
  onSelectTab: (tab: PanelTab) => void
  panelTab: PanelTab
  preview: OfferOutput["layouts"][number] | undefined
}) {
  const { control } = useFormContext<OfferInput>()
  const layout = useWatch({ control, name: `layouts.${layoutIndex}` })
  const { data: inventoryItems = [] } = useQuery(inventoryQueries.list())

  if (!layout || !isItemSetLayout(layout)) return null

  return (
    <article className="flex flex-col gap-3">
      <LayoutPlanHeader
        hasLayoutCount={false}
        layoutIndex={layoutIndex}
        onDuplicate={onDuplicate}
        onRemove={onRemove}
        preview={preview}
      />

      <button
        className={`flex w-full max-w-md flex-col gap-1 border border-foreground/40 p-3 text-left text-sm transition-colors hover:bg-accent ${
          isSelected ? "border-primary bg-accent" : ""
        }`}
        onClick={onSelect}
        type="button"
      >
        {layout.items.length === 0 ? (
          <span className="text-muted-foreground">
            Zestaw jest pusty. Kliknij, żeby dodać elementy.
          </span>
        ) : (
          layout.items.map(({ id, quantity }) => (
            <span className="flex justify-between gap-4" key={id}>
              <span>
                {inventoryItems.find((item) => item.id === id)?.label ?? id}
              </span>
              <span className="tabular-nums">{quantity} szt.</span>
            </span>
          ))
        )}
      </button>

      {isSelected && (
        <EditorPanel
          onSelectTab={onSelectTab}
          tab={panelTab}
          title={`Zestaw ${layoutIndex + 1}`}
        >
          {panelTab === "edit" && (
            <ComponentQuantityFields
              label="Elementy"
              min={1}
              name={`layouts.${layoutIndex}.items`}
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
