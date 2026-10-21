## Data Models and Persistence

### Prisma Lives in src/db Only

All database access sits in `src/db/{entity}.repository.ts` as plain exported async functions with
explicit `Promise<T>` return types. No repository classes. The client is instantiated once, in
`src/db/prisma.ts`. Controllers import repository functions and never touch the client.

```ts
export async function getAllComponents(): Promise<Component[]> {
  return prisma.component.findMany()
}
```

Input types for writes are declared beside the functions that take them (`CreateOfferInput`,
`UpdateOfferInput`).

### An Offer Is Priced at Today's Prices

The `Offer` model persists both `input` and `output` as JSON, but reading an offer recomputes its
output from `input` against the current inventory (decision 7). The stored `output` is written on
save and not read back.

### An Offer Belongs to the User Who Created It

`Offer.userId` is required and carries a foreign key to `User`. Ownership is a column, not a
convention: the repository takes an `OfferScope` and filters on it, so an offer cannot be read or
written through any endpoint by anyone but its author (or an ADMIN). No endpoint reassigns it,
which is why `UpdateOfferInput` excludes `userId`.

### Clear Names, Real Constraints

Singular model names, uniqueness and nullability expressed in the schema rather than in application
code, indexes on the columns that are actually filtered on (`Component.category`,
`Offer.createdAt`, `Offer.userId`), and timestamps where the record's age matters.

### Validation Belongs Above the Database

Database constraints are the last line, not the first. The request is validated against its Valibot
schema in the controller before anything reaches Prisma. See `../global/validation.md`.
