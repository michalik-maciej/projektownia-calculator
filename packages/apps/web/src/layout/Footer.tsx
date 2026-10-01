import { useIsAdmin } from "../user/hooks/useIsAdmin"

export function Footer() {
  const isAdmin = useIsAdmin()

  if (!isAdmin) return null

  return (
    <footer
      className="px-4 py-2 text-center text-xs text-muted-foreground"
      title="Wersja aplikacji i commit, z którego została zbudowana"
    >
      Wersja {__APP_VERSION__} · {__APP_COMMIT__}
    </footer>
  )
}
