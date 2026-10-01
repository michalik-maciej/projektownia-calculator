import type { PropsWithChildren } from "react"

import { Footer } from "./Footer"
import { TopBar } from "./TopBar"

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="flex-1 p-4">{children}</main>
      <Footer />
    </div>
  )
}
