export function planUnitClassName(isSelected: boolean) {
  return `relative -ml-px flex shrink-0 flex-col items-center justify-center gap-1 border border-foreground font-mono text-xs transition-colors first:ml-0 hover:bg-highlight-soft/50 ${
    isSelected ? "z-10 border-2 bg-highlight-soft" : "bg-card/90"
  }`
}
