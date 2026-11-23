import { KeyRound, Loader2, Trash2Icon, UserPlus } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { MIN_PASSWORD_LENGTH } from "@/schemas/auth/Login.schema"
import type { User } from "@/schemas/user/User.schema"

import { ROLE_LABELS } from "./labels.role"
import { SetUserPasswordDialog } from "./SetUserPasswordDialog"
import { Badge } from "../../core/ui/badge"
import { Button } from "../../core/ui/button"
import { ConfirmDialog } from "../../core/ui/confirm-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../core/ui/dialog"
import { Input } from "../../core/ui/input"
import { Label } from "../../core/ui/label"
import { useCreateUser } from "../hooks/useCreateUser"
import { useDeleteUser } from "../hooks/useDeleteUser"
import { usersQueries } from "../users.api"

type CreateFormValues = {
  email: string
  password: string
}

function CreateUserForm() {
  const { mutateAsync, isPending } = useCreateUser()
  const form = useForm<CreateFormValues>({
    defaultValues: { email: "", password: "" },
  })
  const { errors } = form.formState

  const submit = async (values: CreateFormValues) => {
    await mutateAsync(values)
    form.reset()
  }

  return (
    <form
      className="flex items-end gap-2 border-b pb-4"
      onSubmit={form.handleSubmit(submit)}
    >
      <div className="flex flex-col gap-1 grow">
        <Label htmlFor="new-user-email">Email</Label>
        <Input
          id="new-user-email"
          {...form.register("email", {
            required: "Podaj adres e-mail",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "To nie wygląda na adres e-mail",
            },
          })}
        />
        {errors.email?.message && (
          <span className="text-xs text-destructive">
            {errors.email.message}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1 grow">
        <Label htmlFor="new-user-password">Hasło</Label>
        <Input
          id="new-user-password"
          type="password"
          {...form.register("password", {
            required: "Podaj hasło",
            minLength: {
              value: MIN_PASSWORD_LENGTH,
              message: `Hasło ma co najmniej ${MIN_PASSWORD_LENGTH} znaków`,
            },
          })}
        />
        {errors.password?.message && (
          <span className="text-xs text-destructive">
            {errors.password.message}
          </span>
        )}
      </div>
      <Button className="mt-6" disabled={isPending} type="submit">
        {isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
        Dodaj
      </Button>
    </form>
  )
}

function UserRow({
  onRequestDelete,
  onRequestPasswordChange,
  user,
}: {
  onRequestDelete: (user: User) => void
  onRequestPasswordChange: (user: User) => void
  user: User
}) {
  return (
    <li className="flex items-center justify-between gap-4 py-2">
      <div className="flex items-center gap-2">
        <span>{user.email}</span>
        <Badge variant="outline">{ROLE_LABELS[user.role]}</Badge>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onRequestPasswordChange(user)}
          size="icon"
          type="button"
          variant="outline"
          aria-label="Ustaw hasło"
        >
          <KeyRound className="h-4 w-4" />
        </Button>
        <Button
          onClick={() => onRequestDelete(user)}
          size="icon"
          type="button"
          disabled={user.role === "ADMIN"}
          variant="destructive"
          aria-label="Usuń użytkownika"
        >
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </div>
    </li>
  )
}

export function UserManagementDialog({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void
}) {
  const { data: users, isPending } = useQuery(usersQueries.list())
  const deleteMutation = useDeleteUser()
  const [passwordTarget, setPasswordTarget] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <>
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="p-2 text-foreground/60">
              Zarządzanie użytkownikami
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 p-2">
            <CreateUserForm />
            {isPending ? (
              <Loader2 className="animate-spin self-center" />
            ) : (
              <ul className="flex flex-col divide-y">
                {users?.map((user) => (
                  <UserRow
                    key={user.id}
                    onRequestDelete={setDeleteTarget}
                    onRequestPasswordChange={setPasswordTarget}
                    user={user}
                  />
                ))}
              </ul>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {passwordTarget && (
        <SetUserPasswordDialog
          email={passwordTarget.email}
          onOpenChange={(open) => !open && setPasswordTarget(null)}
          userId={passwordTarget.id}
        />
      )}
      <ConfirmDialog
        confirmLabel="Usuń"
        description={
          deleteTarget
            ? `Czy na pewno chcesz usunąć użytkownika ${deleteTarget.email}?`
            : ""
        }
        isPending={deleteMutation.isPending}
        onConfirm={handleDelete}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        open={!!deleteTarget}
        title="Usuń użytkownika"
      />
    </>
  )
}
