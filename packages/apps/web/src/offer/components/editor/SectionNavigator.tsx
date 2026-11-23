import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "../../../core/ui/button"

export function SectionNavigator({
  count,
  index,
  onSelect,
}: {
  count: number
  index: number
  onSelect: (index: number) => void
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        className="h-7 w-7"
        aria-label="Poprzedni"
        disabled={index <= 0}
        onClick={() => onSelect(index - 1)}
        size="icon"
        type="button"
        variant="outline"
      >
        <ChevronLeft className="h-3 w-3" />
      </Button>
      <span className="w-12 text-center text-xs tabular-nums text-muted-foreground">
        {index + 1} z {count}
      </span>
      <Button
        className="h-7 w-7"
        aria-label="Następny"
        disabled={index >= count - 1}
        onClick={() => onSelect(index + 1)}
        size="icon"
        type="button"
        variant="outline"
      >
        <ChevronRight className="h-3 w-3" />
      </Button>
    </div>
  )
}
