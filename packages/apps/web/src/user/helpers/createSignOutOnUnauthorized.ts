import { isUnauthorized } from "../../core/createMethod.api"

const LOGIN_PATH = "/login"

export function createSignOutOnUnauthorized({
  getPathname,
  signOut,
}: {
  getPathname: () => string
  signOut: () => void
}) {
  return (error: Error) => {
    if (isUnauthorized(error) && getPathname() !== LOGIN_PATH) signOut()
  }
}
