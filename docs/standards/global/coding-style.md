## Coding Style

### Prettier Settings Are Not Negotiable

80 character line width, 2 space indentation, no semicolons, trailing commas everywhere.
`pnpm format` fixes, `pnpm format:check` verifies, and CI runs the check over the whole repository.

Generated files are outside that rule and listed in `.prettierignore`: `pnpm-lock.yaml`,
`routeTree.gen.ts` and the `CHANGELOG.md` that Release Please writes belong to the tools that write
them. Formatting one of them does not stay fixed, it only guarantees that the next `pnpm install`,
route generation or release PR rewrites the whole file and buries the real change in noise.

### Three-Tier Import Grouping

Imports sit in three blocks separated by blank lines: third-party packages, then `@/` alias imports,
then relative imports. Enforced by `eslint-plugin-simple-import-sort`, and it holds in every file.

### Aliases Across Packages, Relative Paths Inside One

A cross-package import uses `@/domain/*` or `@/schemas/*`. An import inside the same package is
relative. Reaching out of a package with `../../src/*` is an ESLint error.

```ts
import { OfferInput } from "@/schemas/Offer.schema"
import { Component } from "../../models/component"
```

### Named Exports

Modules export named bindings. `export default` appears only on the three plain Express routers,
which export their configured `router`.

### Function Declarations for Exported Functions

Exported functions are written `export function name(...)`. Arrow consts are reserved for trivial
one-liners and for data constants.

### `type` Over `interface`

Object shapes, props and domain models are declared as `type` aliases. `interface` appears only for
a local component `Props`.

### Numbers Get Names

No bare numeric literal at the point of use. Shared constants live at module top level, single-use
ones at the top of the function body, both `UPPER_SNAKE_CASE` and usually carrying their unit:
`BACK_CLEARANCE_CM`, `AUTOSAVE_DEBOUNCE_MS`, `SCALE_PX_PER_CM`.

### Guard Index Access, Never Assert It Away

`noUncheckedIndexedAccess` is on. Narrow an indexed read or an optional field with a real guard
(`?? fallback`, `if (!x) return`, `== null`), never with `!` and never with a cast.

### lodash/fp in Domain and API, Native Methods in Web

Domain and API code uses curried, data-last `lodash/fp` helpers for collection work. The browser
bundle imports lodash nowhere and uses native array methods.

### No Nested Ternaries

A ternary handles one either/or and nothing more; nesting one inside another is an ESLint error
(`no-nested-ternary`). Three or more branches go into a named function with early returns, or, in
JSX, into separate conditional blocks whose conditions are mutually exclusive.

```ts
export function describeSaveState({ hasFailed, isDirty, isSaving }: SaveState) {
  if (hasFailed) return "Nie zapisano"
  if (isSaving) return "Zapisywanie…"
  if (isDirty) return "Niezapisane zmiany"
  return "Zapisano"
}
```

### Descriptive Names, Focused Functions

Names communicate intent; no cryptic abbreviations outside tight loops. A function does one thing.

### No Dead Code

Unused imports, commented-out blocks and orphaned functions are deleted, not left behind.
