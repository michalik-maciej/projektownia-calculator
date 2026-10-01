import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import { authApi } from "../auth.api"

export function useDemoLogin() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authApi.demo(),
    onSuccess: ({ exampleOfferId }) => {
      queryClient.invalidateQueries({ queryKey: ["auth"] })
      navigate(
        exampleOfferId
          ? { to: "/offer", search: { offerId: exampleOfferId } }
          : { to: "/" },
      )
    },
    onError: (error) => {
      console.error("Starting the demo session failed:", error)
      toast.error("Nie udało się otworzyć wersji demo.", {
        position: "top-center",
      })
    },
  })
}
