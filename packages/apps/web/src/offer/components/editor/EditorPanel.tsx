import type { PropsWithChildren } from "react"

import { Button } from "../../../core/ui/button"

export type PanelTab = "breakdown" | "edit"

const PANEL_TABS = ["edit", "breakdown"] as const

const TAB_LABELS: Record<PanelTab, string> = {
  breakdown: "Rozpiska",
  edit: "Edycja",
}

export function EditorPanel({
  children,
  onSelectTab,
  tab,
  title,
}: PropsWithChildren<{
  onSelectTab?: (tab: PanelTab) => void
  tab?: PanelTab
  title: string
}>) {
  return (
    <aside className="fixed top-16 right-0 bottom-0 z-40 flex w-sm flex-col border-l bg-background py-4 pl-4">
      <div className="mb-4 flex items-center justify-between gap-2 pr-6">
        <h2 className="text-lg font-semibold leading-none tracking-tight">
          {title}
        </h2>
        {onSelectTab && tab && (
          <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
            {PANEL_TABS.map((panelTab) => (
              <Button
                aria-pressed={panelTab === tab}
                key={panelTab}
                onClick={() => onSelectTab(panelTab)}
                size="sm"
                type="button"
                variant={panelTab === tab ? "outline" : "ghost"}
              >
                {TAB_LABELS[panelTab]}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-6">{children}</div>
    </aside>
  )
}
