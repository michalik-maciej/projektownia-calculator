import { ListPlus, RectangleHorizontal, Rows2 } from "lucide-react"

export function AddLayoutSlot({
  onAddGondola,
  onAddItemSet,
  onAddWall,
}: {
  onAddGondola: (() => void) | null
  onAddItemSet: () => void
  onAddWall: (() => void) | null
}) {
  const options = [
    {
      Icon: RectangleHorizontal,
      label: "Ciąg przyścienny",
      name: "Dodaj ciąg przyścienny",
      onAdd: onAddWall,
    },
    {
      Icon: Rows2,
      label: "Gondola",
      name: "Dodaj gondolę",
      onAdd: onAddGondola,
    },
    {
      Icon: ListPlus,
      label: "Zestaw elementów",
      name: "Dodaj zestaw elementów",
      onAdd: onAddItemSet,
    },
  ]

  return (
    <div
      aria-label="Dodaj do planu"
      className="flex w-120 flex-col rounded-sm border-[1.5px] border-dashed border-muted-foreground/70 bg-card/60"
      role="group"
    >
      <div className="flex h-18 divide-x-[1.5px] divide-dashed divide-input">
        {options.map(({ Icon, label, name, onAdd }) => (
          <button
            aria-label={name}
            className="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-highlight-soft hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            disabled={!onAdd}
            key={name}
            onClick={() => onAdd?.()}
            type="button"
          >
            <Icon className="size-5.5" strokeWidth={1.75} />+ {label}
          </button>
        ))}
      </div>
      {!onAddWall && (
        <p className="border-t-[1.5px] border-dashed border-input px-3 py-2 text-xs text-muted-foreground">
          Uzupełnij magazyn komponentów, żeby móc dodać ciąg.
        </p>
      )}
    </div>
  )
}
