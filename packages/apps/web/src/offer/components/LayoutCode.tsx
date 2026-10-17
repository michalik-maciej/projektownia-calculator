export function LayoutCode({
  code,
  isHighlighted = false,
}: {
  code: string
  isHighlighted?: boolean
}) {
  return (
    <span
      className={`inline-flex h-5 items-center rounded-sm px-1.5 font-display text-[13px] font-semibold tracking-wide ${
        isHighlighted ? "bg-highlight" : "bg-border"
      }`}
    >
      {code}
    </span>
  )
}
