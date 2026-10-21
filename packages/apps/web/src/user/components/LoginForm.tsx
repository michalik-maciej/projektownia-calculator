import { Loader2, PlayCircle, UserPen } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "../../core/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../core/ui/dialog"
import { Input } from "../../core/ui/input"
import { Label } from "../../core/ui/label"
import { textEyebrow } from "../../core/ui/typography"
import { useDemoLogin } from "../hooks/useDemoLogin"
import { useLoginUser } from "../hooks/useLoginUser"

export const LoginForm = () => {
  const { mutate: login, isPending } = useLoginUser()
  const { mutate: openDemo, isPending: isDemoPending } = useDemoLogin()
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  })
  const { errors } = form.formState

  return (
    <Dialog open>
      <DialogContent
        className="flex flex-col gap-6 border-t-[6px] border-t-highlight p-8 shadow-lg sm:max-w-sm"
        showCloseButton={false}
      >
        <DialogHeader className="gap-1">
          <DialogTitle className="flex items-center gap-2.5 font-display text-2xl font-bold uppercase tracking-wide">
            <img alt="" className="h-10" src="/logo.svg" />
            Projektownia
          </DialogTitle>
          <p className={textEyebrow}>Zaloguj się, aby kalkulować</p>
        </DialogHeader>
        <form
          className="flex flex-col gap-3.5"
          onSubmit={form.handleSubmit((values) => login(values))}
        >
          <div className="flex flex-col gap-1.5">
            <Label className={textEyebrow} htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
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
          <div className="flex flex-col gap-1.5">
            <Label className={textEyebrow} htmlFor="password">
              Hasło
            </Label>
            <Input
              id="password"
              type="password"
              {...form.register("password", {
                required: "Podaj hasło",
                minLength: {
                  value: 8,
                  message: "Hasło ma co najmniej 8 znaków",
                },
              })}
            />
            {errors.password?.message && (
              <span className="text-xs text-destructive">
                {errors.password.message}
              </span>
            )}
          </div>
          <Button className="mt-2 w-full" disabled={isPending} type="submit">
            Zaloguj
            {isPending ? <Loader2 className="animate-spin" /> : <UserPen />}
          </Button>
        </form>
        <div className="flex flex-col gap-2 border-t pt-5">
          <Button
            className="w-full bg-highlight text-foreground hover:bg-highlight/90"
            disabled={isDemoPending}
            onClick={() => openDemo()}
            type="button"
          >
            {isDemoPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <PlayCircle />
            )}
            Demo
          </Button>
          <p className="font-mono text-xs text-muted-foreground">
            Wejście bez konta. Ograniczona funkcjonalność.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
