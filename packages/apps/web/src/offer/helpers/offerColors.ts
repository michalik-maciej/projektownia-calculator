import type { MetalColor, PriceStripColor } from "@/schemas/Offer.schema"

export type ColorSwatch = {
  fill: string
  label: string
}

export const DEFAULT_METAL_COLOR: MetalColor = "graphite"
export const DEFAULT_PRICE_STRIP_COLOR: PriceStripColor = "transparent"

export const PRICE_STRIP_COLOR_SWATCHES: Record<PriceStripColor, ColorSwatch> =
  {
    black: { fill: "#000000", label: "czarny" },
    blue: { fill: "#0000ff", label: "niebieski" },
    green: { fill: "#00ff00", label: "zielony" },
    orange: { fill: "#ffa500", label: "pomarańczowy" },
    red: { fill: "#ff0000", label: "czerwony" },
    transparent: { fill: "transparent", label: "przezroczysty" },
    white: { fill: "#ffffff", label: "biały" },
    yellow: { fill: "#ffff00", label: "żółty" },
  }

export const METAL_COLOR_SWATCHES: Record<MetalColor, ColorSwatch> = {
  cream: { fill: "#faffff", label: "kremowy" },
  graphite: { fill: "#3d4252", label: "grafitowy" },
}
