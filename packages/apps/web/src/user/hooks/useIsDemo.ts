import { useQuery } from "@tanstack/react-query"

import { authQueries } from "../auth.api"

export function useIsDemo(): boolean {
  const { data } = useQuery(authQueries.user())

  return data?.user.role === "DEMO"
}
