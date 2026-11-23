import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"

import { usersApi } from "../users.api"

type Input = {
  id: string
  password: string
}

export function useSetUserPassword() {
  return useMutation({
    mutationFn: ({ id, password }: Input) =>
      usersApi.setPassword({ params: { id }, data: { password } }),
    onSuccess: () => {
      toast.success("Hasło zostało zmienione.", { position: "top-center" })
    },
    onError: (error) => {
      console.error("Setting the user password failed:", error)
      toast.error("Nie udało się zmienić hasła.", { position: "top-center" })
    },
  })
}
