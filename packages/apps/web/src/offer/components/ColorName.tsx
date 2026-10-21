import { ColorSwatch } from "../helpers/offerColors"

export function ColorName({ fill, label }: ColorSwatch) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="inline-block h-3 w-3 border border-foreground/40"
        style={{ backgroundColor: fill }}
      />
      {label}
    </span>
  )
}
