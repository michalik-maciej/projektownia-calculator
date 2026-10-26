## Domain Layer

### The Domain Package Depends on Nothing

`packages/domain` imports nothing except `packages/schemas`. No Express, no React, no Prisma, no
HTTP client, no date library. Anything environmental (reading the inventory, persisting an offer,
formatting for a user) belongs to the caller and arrives as an argument. Nothing enforces this
automatically: check `packages/domain/package.json` before adding a dependency.

This is what lets the calculation rules survive a framework rewrite, and what lets the tests run with
no database, no server and no mocks.

### Four Layers, in One Direction

- `models/` holds domain types (constants the browser also needs live in `packages/schemas`)
- `calculations/` holds single mathematical formulas
- `transformations/` holds pure data mapping
- `orchestrations/` is the public API: it takes user input and combines the layers below into demand
  per layout or per offer, which `createOfferPreview` assembles into an `OfferOutput`
- `fixtures/` holds test data

Calls go downwards only. `createOfferPreview` is the entry point the API calls.

### One Folder per Function

Every unit of logic gets a folder named exactly after the function, holding `{name}.ts` and
`{name}.test.ts` and nothing else. Folder name, file name and exported function name are identical.
Only `models/` and `fixtures/` hold flat files.

### The (context, inventory) Signature

A domain function takes a destructured context object first and the `Component[]` inventory second,
and returns a new value. The context shape is declared as a named `{Name}CalculationContext` type
directly above the function.

```ts
type FootCalculationContext = {
  depth: number
  numberOfLayouts: number
  numberOfUnits: number
}

export function calculateFootDemand(
  { depth, numberOfLayouts, numberOfUnits }: FootCalculationContext,
  inventory: Component[],
) { ... }
```

### Pure Functions, No I/O, No Catching

Domain code does not mutate its inputs, perform I/O, or catch errors. It throws
`MissingComponentError` and lets the edge decide what that means over HTTP.
