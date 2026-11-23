## Data Fetching

### No Hand-Written fetch

Every endpoint is declared in `{feature}.api.ts` through the `createApiMethod` contract factory,
which takes the method, the path, the Valibot response schema from `packages/schemas` and, where
there is a body, its payload type. The wrapper handles the request, validation and the 204 case.

```ts
export const offerApi = {
  details: createApiMethod({
    method: "GET",
    path: `${apiUrl}/offers/:id`,
    response: SavedOfferSchema,
  }),
}
```

Each api module reads `VITE_API_URL` at module load and throws immediately if it is missing.

### Query Options Live in {feature}Queries

Alongside `{feature}Api`, each feature exports `{feature}Queries` holding TanStack Query option
factories. Query keys are hierarchical `as const` tuples prefixed with the feature name:
`["offer", "list"]`, `["offer", "details", id]`, `["inventory", "list"]`.

### Components Call Hooks, Hooks Call the API

Each hook is one file under `hooks/`, named `use{Thing}` to match its export. Mutation hooks are
named after the action (`useCreateOffer`, `useDeleteInventoryItem`). A component never calls
`offerApi.*` directly; it consumes a hook, or a query-options object from `{feature}Queries`.

### Mutations Invalidate and Report in Polish

A mutation's `onSuccess` invalidates or seeds the query key it affected. User-visible outcomes are
raised with `toast.success` / `toast.error`, always with `{ position: "top-center" }`, always in
Polish. Failures also log in English: `console.error("<what> failed:", error)`.

```ts
onError: (error) => {
  console.error("Creating the offer failed:", error)
  toast.error("Nie udało się utworzyć oferty.", { position: "top-center" })
}
```

### Errors Arrive as ApiError

The fetch wrapper throws a typed `ApiError` carrying status, statusText, method, url and body text,
mirroring the domain's `MissingComponentError`. Callers branch on the named checks
`isNotFound(error)`, `isConflict(error)` and `isUnauthorized(error)` rather than inspecting a
`Response`.

A 404 is an answer, not a failure to retry: `offerQueries.details` turns retries off for it, and
`useOffer` reports it as `isMissing` so a route can say that the offer is gone or not the caller's
instead of rendering an empty editor.
