import { CopyPlusIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../core/ui/accordion"
import { Button } from "../../core/ui/button"
import { useIsDemo } from "../../user/hooks/useIsDemo"
import { CATEGORY_LABELS } from "../components/labels.inventory"
import { sortInventoryItemsBySize } from "../helpers/sortInventoryItemsBySize"
import { inventoryQueries } from "../inventory.api"

export function InventoryPage() {
  const isDemo = useIsDemo()
  const { data, isPending, error } = useQuery({
    ...inventoryQueries.list(),
    select: (components) =>
      sortInventoryItemsBySize(components).reduce<
        Record<string, typeof components>
      >((acc, component) => {
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
      <div className="flex items-center justify-between mb-6">
        <h1>Katalog części</h1>
        {isDemo ? (
          <p className="text-xs text-muted-foreground">
            Wersja demo: katalog tylko do odczytu
          </p>
        ) : (
          <Button variant="secondary" size="sm" asChild>
            <Link search={true} to="/inventory/new">
              <CopyPlusIcon />
              Dodaj
            </Link>
          </Button>
        )}
      </div>
      <Accordion type="single" collapsible className="max-w-lg">
        {Object.entries(data).map(([category, items]) => (
          <AccordionItem key={category} value={category}>
            <AccordionTrigger>
              {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
            </AccordionTrigger>
            <AccordionContent>
              {items.map((item) => (
                <Link
                  key={item.id}
                  to="/inventory/$componentId"
                  params={{ componentId: item.id }}
                  search={true}
                  className="block py-1"
                >
                  {item.label}
                </Link>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
