import { Link } from "@tanstack/react-router"

import { OfferSaveStatus } from "../offer/components/OfferSaveStatus"
import { UserMenu } from "../user/components/UserMenu"

const tabClassName =
  "inline-flex h-9 items-center rounded-lg px-3.5 font-display text-[15px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:bg-highlight aria-[current=page]:text-foreground"

export function TopBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-15 items-center border-b bg-card px-6">
      <nav
        className="flex w-full items-center justify-between gap-4"
        aria-label="Primary"
      >
        <div className="flex items-center gap-8">
          <a
            className="flex items-center gap-2.5 font-display text-xl font-bold uppercase tracking-wide"
            href="https://projekty-sklepow.pl/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <img alt="" className="h-9" src="/logo.svg" />
            Projektownia
          </a>
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
          <OfferSaveStatus />
          <UserMenu />
        </div>
      </nav>
    </header>
  )
}
