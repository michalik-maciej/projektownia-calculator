import * as React from "react"

import { Input } from "../../core/ui/input"
import { cn } from "../../core/ui/utils"
import { passwordManagerIgnore } from "../helpers/passwordManagerIgnore"

export const PriceInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => (
  <div className="relative">
    <Input
      {...passwordManagerIgnore}
      className={cn("pr-8 text-right", className)}
      min={0}
      ref={ref}
      step="0.01"
      type="number"
      {...props}
    />
    <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-sm text-muted-foreground">
      zł
    </span>
  </div>
))
PriceInput.displayName = "PriceInput"
