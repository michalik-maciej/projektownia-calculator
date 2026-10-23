import { Button } from "../../../core/ui/button"

export function ChoiceField<Value extends number>({
  label,
  onChange,
  options,
  value,
}: {
  label: string
  onChange: (value: Value) => void
  options: { label: string; value: Value }[]
  value: Value
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-28 shrink-0 text-sm text-muted-foreground">
        {label}
      </span>
      <div className="flex gap-1">
        {options.map((option) => (
          <Button
            aria-pressed={option.value === value}
            className="h-8 px-2.5"
            key={option.value}
            onClick={() => onChange(option.value)}
            size="sm"
            type="button"
            variant={option.value === value ? "default" : "outline"}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
