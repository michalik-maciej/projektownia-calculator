import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import { LoginInput } from "@/schemas/auth/Login.schema"

import { authApi } from "../auth.api"

export function useLoginUser() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login({ data }),
    onSuccess: () => {
      toast.success("Pomyślnie zalogowano.", { position: "top-center" })
      navigate({ to: "/" })
    },
    onError: (error) => {
      console.error("Logging in failed:", error)
      toast.error("Nie udało się zalogować.", {
        position: "top-center",
      })
    },
  })
}
