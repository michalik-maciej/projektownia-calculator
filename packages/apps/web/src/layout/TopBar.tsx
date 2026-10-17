import { LogOut } from "lucide-react"
import { Link } from "@tanstack/react-router"

import { Button } from "../core/ui/button"
import { UserManagementButton } from "../user/components/UserManagementButton"
import { useLogoutUser } from "../user/hooks/useLogoutUser"

function UserButton() {
  const { mutate: logout } = useLogoutUser()
  return (
    <Button
      size="icon"
      variant="outline"
      className="rounded-xl"
      onClick={() => logout()}
    >
      <LogOut className="h-5 w-5" />
    </Button>
  )
}

const activeTabClassName =
  "aria-[current=page]:outline-2 aria-[current=page]:outline-offset-2 aria-[current=page]:outline-primary"

export function TopBar() {
  return (
    <header className="flex items-center justify-between gap-4 border-b px-4 py-3">
      <nav className="flex justify-between w-full" aria-label="Primary">
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link
              className={activeTabClassName}
              search={(previous) => previous}
              to="/offer"
            >
              Oferta
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link
              className={activeTabClassName}
              search={(previous) => previous}
              to="/config"
            >
              Konfigurator
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link
              className={activeTabClassName}
              search={(previous) => previous}
              to="/order"
            >
              Rozpiska
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link className={activeTabClassName} search={true} to="/inventory">
              Katalog części
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <UserManagementButton />
          <UserButton />
        </div>
      </nav>
    </header>
  )
}
