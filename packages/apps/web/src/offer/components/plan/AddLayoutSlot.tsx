import { FileUp, ListPlus, RectangleHorizontal, Rows2 } from "lucide-react"

const optionClassName =
  "flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 text-[13px] font-semibold text-muted-foreground transition-colors hover:bg-highlight-soft hover:text-foreground"

export function AddLayoutSlot({
  isImportingPdf = false,
  onAddGondola,
  onAddItemSet,
  onAddWall,
  onImportPdf,
}: {
  isImportingPdf?: boolean
  onAddGondola: (() => void) | null
  onAddItemSet: () => void
  onAddWall: (() => void) | null
  onImportPdf: ((file: File) => void) | null
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
      className="flex w-132 flex-col rounded-sm border-[1.5px] border-dashed border-muted-foreground/70 bg-card/60"
      role="group"
    >
      <div className="flex divide-x-[1.5px] divide-dashed divide-input">
        {options.map(({ Icon, label, name, onAdd }) => (
          <button
            aria-label={name}
            className={`${optionClassName} disabled:pointer-events-none disabled:opacity-40 p-2`}
            disabled={!onAdd}
            key={name}
            onClick={() => onAdd?.()}
            type="button"
          >
            <Icon className="size-5.5" strokeWidth={1.75} />+ {label}
          </button>
        ))}
        {onImportPdf && (
          <label
            className={`${optionClassName} focus-within:bg-highlight-soft has-disabled:pointer-events-none has-disabled:opacity-40`}
          >
            <FileUp className="size-5.5" strokeWidth={1.75} />
            {isImportingPdf ? "Importowanie…" : "Import z PDF"}
            <input
              accept="application/pdf"
              aria-label="Importuj ciągi z PDF"
              className="sr-only"
              disabled={isImportingPdf}
              onChange={(event) => {
                const [file] = event.target.files ?? []
                event.target.value = ""
                if (file) onImportPdf(file)
              }}
              type="file"
            />
          </label>
        )}
      </div>
      {!onAddWall && (
        <p className="border-t-[1.5px] border-dashed border-input px-3 py-2 text-xs text-muted-foreground">
          Uzupełnij magazyn komponentów, żeby móc dodać ciąg.
        </p>
      )}
    </div>
  )
}
