import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { isConflict } from "../../core/createMethod.api"
import { usersApi, usersQueries } from "../users.api"

export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => usersApi.delete({ params: { id } }),
    onSuccess: async () => {
      toast.success("Użytkownik został usunięty.", { position: "top-center" })
      await queryClient.invalidateQueries({
        queryKey: usersQueries.list().queryKey,
      })
    },
    onError: (error) => {
      console.error("Deleting the user failed:", error)
      const message = isConflict(error)
        ? "Nie można usunąć użytkownika, który ma zapisane oferty."
        : "Nie udało się usunąć użytkownika."
      toast.error(message, { position: "top-center" })
    },
  })
}
