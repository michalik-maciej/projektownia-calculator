import type { PropsWithChildren } from "react"

export type PanelTab = "breakdown" | "edit"

const PANEL_TABS = ["edit", "breakdown"] as const

const TAB_LABELS: Record<PanelTab, string> = {
  breakdown: "Rozpiska",
  edit: "Edycja",
}

export function EditorPanel({
  children,
  eyebrow,
  onSelectTab,
  tab,
  title,
}: PropsWithChildren<{
  eyebrow?: string
  onSelectTab?: (tab: PanelTab) => void
  tab?: PanelTab
  title: string
}>) {
  return (
    <aside className="fixed top-15 right-0 bottom-0 z-40 flex w-sm flex-col border-l bg-card py-6 pl-6">
      <div className="mb-4 flex items-center justify-between gap-2 pr-6">
        <div className="flex flex-col gap-0.5">
          {eyebrow && (
            <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
          )}
          <h2 className="font-display text-[17px] font-bold uppercase tracking-wide">
            {title}
          </h2>
        </div>
        {onSelectTab && tab && (
          <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
            {PANEL_TABS.map((panelTab) => (
              <button
                aria-pressed={panelTab === tab}
                className="h-7.5 cursor-pointer rounded-md px-3 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                key={panelTab}
                onClick={() => onSelectTab(panelTab)}
                type="button"
              >
                {TAB_LABELS[panelTab]}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-6">{children}</div>
    </aside>
  )
}
