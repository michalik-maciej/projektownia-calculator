import { Info } from "lucide-react"
import { useState } from "react"

import { PdfImportGuide } from "./PdfImportGuide"

export function PdfImportHelp() {
  const [isGuideOpen, setIsGuideOpen] = useState(false)

  return (
    <>
      <button
        aria-label="Jak przygotować plik PDF"
        className="absolute right-0 cursor-pointer rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        onClick={() => setIsGuideOpen(true)}
        type="button"
      >
        <Info className="size-6 p-1" strokeWidth={2.5} />
      </button>
      <PdfImportGuide isOpen={isGuideOpen} onOpenChange={setIsGuideOpen} />
    </>
  )
}
