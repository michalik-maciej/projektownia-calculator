import { CopyPlusIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Link, useParams } from "@tanstack/react-router"

import { compareComponents } from "@/schemas/inventory/compareComponents"
import { COMPONENT_CATEGORIES } from "@/schemas/inventory/Component.schema"

import { InventoryItemPriceField } from "./InventoryItemPriceField"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../core/ui/accordion"
import { Button } from "../../core/ui/button"
import { textSection } from "../../core/ui/typography"
import { CATEGORY_LABELS } from "../../offer/helpers/categoryLabels"
import { useIsAdmin } from "../../user/hooks/useIsAdmin"
import { inventoryQueries } from "../inventory.api"

export function InventoryPage() {
  const isAdmin = useIsAdmin()
  const { componentId } = useParams({ strict: false })
  const { data, isPending, error } = useQuery({
    ...inventoryQueries.list(),
    select: (components) =>
      [...components]
        .sort(compareComponents)
        .reduce<Record<string, typeof components>>((acc, component) => {
          acc[component.category] ??= []
          acc[component.category]?.push(component)
          return acc
        }, {}),
  })

  if (error) {
    return <div>Błąd ładowania katalogu.</div>
  }

  if (isPending) {
    return <div>Ładowanie...</div>
  }

  return (
    <section className="m-8 w-md">
      <div className="flex items-center justify-end mb-6">
        {!isAdmin ? (
          <p className="text-xs text-muted-foreground">
            Katalog tylko do odczytu
          </p>
        ) : (
          <Button size="sm" asChild>
            <Link search={true} to="/inventory/new">
              <CopyPlusIcon />
              Dodaj
            </Link>
          </Button>
        )}
      </div>
      <Accordion type="single" collapsible className="border bg-card">
        {COMPONENT_CATEGORIES.flatMap((category) => {
          const items = data[category] ?? []
          return items.length === 0 ? [] : [{ category, items }]
        }).map(({ category, items }) => (
          <AccordionItem
            className="data-[state=open]:bg-highlight/10"
            key={category}
            value={category}
          >
            <AccordionTrigger
              className={`items-center justify-start rounded-none px-4 py-3 hover:no-underline **:data-[slot=accordion-trigger-icon]:ml-0 ${textSection}`}
            >
              {CATEGORY_LABELS[category]}
              <span className="mr-3 ml-auto font-mono text-xs font-normal text-muted-foreground">
                {items.length}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-0 [&_a]:no-underline">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`relative flex items-center justify-between gap-4 border-t py-1.5 pr-4 pl-7 ${
                    item.id === componentId
                      ? "bg-highlight/20 font-semibold"
                      : ""
                  }`}
                >
                  <Link
                    to="/inventory/$componentId"
                    params={{ componentId: item.id }}
                    search={true}
                    className="truncate after:absolute after:inset-0 hover:underline"
                  >
                    {item.label}
                  </Link>
                  <div className="relative">
                    <InventoryItemPriceField item={item} />
                  </div>
                </div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
