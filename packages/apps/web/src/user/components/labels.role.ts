import type { Role } from "@/schemas/user/User.schema"

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrator",
  USER: "Pracownik",
  DEMO: "Demo",
}
