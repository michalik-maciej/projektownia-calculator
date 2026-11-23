import { ArrowUpRight } from "lucide-react"
import { Link } from "@tanstack/react-router"

import { OfferSaveStatus } from "../offer/components/OfferSaveStatus"
import { UserMenu } from "../user/components/UserMenu"

const tabClassName =
  "inline-flex h-9 items-center rounded-lg px-3.5 font-display text-[15px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:bg-highlight aria-[current=page]:text-foreground"

export function TopBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-15 items-center border-b bg-card px-6 print:hidden">
      <nav
        className="flex w-full items-center justify-between gap-4"
        aria-label="Nawigacja główna"
      >
        <div className="flex items-center gap-8">
          <div className="grid grid-cols-[auto_auto] items-center gap-x-2.5">
            <Link
              className="contents font-display text-xl font-bold uppercase tracking-wide"
              search={(previous) => previous}
              to="/offer"
            >
              <img alt="" className="row-span-2 h-9" src="/logo.svg" />
              <span className="leading-none">Kalkulator</span>
            </Link>
            <span className="pointer-events-none leading-none min-w-36">
              <OfferSaveStatus />
            </span>
          </div>
          <div className="flex gap-1">
            <Link
              className={tabClassName}
              search={(previous) => previous}
              to="/offer"
            >
              Oferta
            </Link>
            <Link
              className={tabClassName}
              search={(previous) => previous}
              to="/config"
            >
              Konfigurator
            </Link>
            <Link
              className={tabClassName}
              search={(previous) => previous}
              to="/order"
            >
              Rozpiska
            </Link>
            <Link className={tabClassName} search={true} to="/inventory">
              Katalog części
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            href="https://projekty-sklepow.pl/"
            rel="noopener noreferrer"
            target="_blank"
          >
            dla
            <span className="font-display text-sm font-bold uppercase tracking-wide">
              Projektowni
            </span>
            <ArrowUpRight className="size-3.5" />
          </a>
          <UserMenu />
        </div>
      </nav>
    </header>
  )
}
