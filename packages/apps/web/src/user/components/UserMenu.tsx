import { LogOut, UsersIcon } from "lucide-react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { ROLE_LABELS } from "./labels.role"
import { UserManagementDialog } from "./UserManagementDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../core/ui/dropdown-menu"
import { authQueries } from "../auth.api"
import { useLogoutUser } from "../hooks/useLogoutUser"

export function UserMenu() {
  const { data } = useQuery(authQueries.user())
  const { mutate: logout } = useLogoutUser()
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false)

  if (!data) return null

  const { email, role } = data.user

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Menu użytkownika"
          className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-highlight font-display text-base font-bold uppercase text-foreground"
        >
          {email.charAt(0)}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <p className="truncate font-semibold">{email}</p>
            <p className="text-xs text-muted-foreground">{ROLE_LABELS[role]}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {role === "ADMIN" && (
            <DropdownMenuItem onSelect={() => setIsUserManagementOpen(true)}>
              <UsersIcon />
              Zarządzaj użytkownikami
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => logout()}>
            <LogOut />
            Wyloguj
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isUserManagementOpen && (
        <UserManagementDialog onOpenChange={setIsUserManagementOpen} />
      )}
    </>
  )
}
