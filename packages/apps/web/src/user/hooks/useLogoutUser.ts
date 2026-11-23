import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import { authApi, authQueries } from "../auth.api"

export function useLogoutUser() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: async () => {
      queryClient.removeQueries({ queryKey: authQueries.user().queryKey })
      await navigate({ to: "/" })
      toast.success("Pomyślnie wylogowano.", { position: "top-center" })
    },
    onError: (error) => {
      console.error("Logging out failed:", error)
      toast.error("Nie udało się wylogować.", {
        position: "top-center",
      })
    },
  })
}
