import { UsersIcon } from "lucide-react"
import { useState } from "react"

import { UserManagementDialog } from "./UserManagementDialog"
import { Button } from "../../core/ui/button"
import { useIsAdmin } from "../hooks/useIsAdmin"

export function UserManagementButton() {
  const isAdmin = useIsAdmin()
  const [open, setOpen] = useState(false)

  if (!isAdmin) return null

  return (
    <>
      <Button
        size="icon"
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label="Zarządzaj użytkownikami"
      >
        <UsersIcon className="h-5 w-5" />
      </Button>
      {open && <UserManagementDialog onOpenChange={setOpen} />}
    </>
  )
}
