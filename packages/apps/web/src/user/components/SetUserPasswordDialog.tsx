import { KeyRound, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"

import { MIN_PASSWORD_LENGTH } from "@/schemas/auth/Login.schema"

import { Button } from "../../core/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../core/ui/dialog"
import { Input } from "../../core/ui/input"
import { Label } from "../../core/ui/label"
import { useSetUserPassword } from "../hooks/useSetUserPassword"

type FormValues = {
  password: string
}

export function SetUserPasswordDialog({
  email,
  onOpenChange,
  userId,
}: {
  email: string
  onOpenChange: (open: boolean) => void
  userId: string
}) {
  const { mutateAsync, isPending } = useSetUserPassword()
  const form = useForm<FormValues>({ defaultValues: { password: "" } })
  const { errors } = form.formState

  const submit = async ({ password }: FormValues) => {
    await mutateAsync({ id: userId, password })
    onOpenChange(false)
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="p-2 text-foreground/60">
            Nowe hasło dla {email}
          </DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-2 p-2"
          onSubmit={form.handleSubmit(submit)}
        >
          <Label htmlFor="new-password">Hasło</Label>
          <Input
            id="new-password"
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
          <DialogFooter className="mt-4">
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              Anuluj
            </Button>
            <Button disabled={isPending} type="submit">
              {isPending ? <Loader2 className="animate-spin" /> : <KeyRound />}
              Zapisz hasło
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
