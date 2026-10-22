## Validation

### Valibot Schemas Are the Contract

Every shape that crosses the API boundary is defined once, as a Valibot schema in
`packages/schemas`. Both sides validate against it and both derive their static types from it with
`v.InferOutput`. A shape is never written twice as an interface on one side and a validator on the
other, and a new schema is added before the API change that needs it.

```ts
export const OfferInputSchema = v.object({ ... })
export type OfferInput = v.InferOutput<typeof OfferInputSchema>
```

### Schemas Compose, They Do Not Repeat

A variant reuses its base: `CreateComponentSchema` builds on `ComponentBaseSchema`,
`UpdateComponentSchema` wraps it in `v.partial(...)`, `MissingComponentSchema` is reused by both
`OfferErrorSchema` and `SavedOfferSchema`.

### Validate at the Controller Boundary, First Statement

A controller that accepts input calls `v.safeParse(Schema, req.body)` (or `req.params`, against the
shared `IdParamSchema`) before doing anything else, and returns 400 with
`{ error, issues: v.flatten(parsed.issues) }` on failure. Nothing downstream revalidates.

```ts
const parsed = v.safeParse(OfferInputSchema, req.body)

if (!parsed.success) {
  return res.status(400).json({
    error: "Invalid input",
    issues: v.flatten(parsed.issues),
  })
}
```

Use the `!parsed.success` spelling rather than `parsed.issues` for the same check.

### Server-Side Always, Client-Side for Feedback

The server validates every entry point regardless of what the client did. Client-side validation
exists for immediate feedback: React Hook Form rules, written inline with Polish messages.

### Specific, Field-Level Messages

`v.flatten` gives per-field issues, and the UI shows them against the field they belong to. A single
"invalid input" for a whole form is not enough.
