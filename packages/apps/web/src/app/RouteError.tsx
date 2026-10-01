import { Link } from "@tanstack/react-router"

import { Button } from "../core/ui/button"

export function RouteError({ error }: { error?: unknown }) {
  const message = error instanceof Error ? error.message : undefined

  return (
    <section className="flex flex-col items-start gap-3 p-8">
      <h1 className="text-xl font-semibold">Coś poszło nie tak</h1>
      <p className="text-sm text-muted-foreground">
        Nie udało się wczytać tego widoku. Odśwież stronę albo wróć do oferty.
      </p>
      {message && <p className="text-xs text-destructive">{message}</p>}
      <Button asChild variant="outline">
        <Link search={true} to="/offer">
          Wróć do oferty
        </Link>
      </Button>
    </section>
  )
}
