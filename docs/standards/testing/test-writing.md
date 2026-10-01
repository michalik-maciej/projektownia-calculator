## Test Writing

### Nothing Is Mocked

There is no mocking library in use and none should be introduced: no `vi.mock`, no `vi.fn`, no
`vi.spyOn`. The domain package depends on nothing, so its rules are plain functions over plain data
and need no test double. Where a collaborator is genuinely required, it is injected instead:
`createOfferPreview` takes the inventory as an argument, and the HTTP test builds its app with
`createApp({ getInventory: async () => componentCatalogMock, offers })`, where `offers` is the
in-memory store in `src/tests/inMemoryOfferStore.ts`. That store is an implementation of the same
`OfferStore` type the Prisma repository satisfies, not a stand-in produced by a mocking library.

This follows directly from the dependency-free domain package. A test that reaches for a mock is a
signal that the code under test grew a dependency it should not have.

### One End-to-End Test, Outside the Unit Suite

`e2e/*.spec.ts` holds the Playwright smoke test and is deliberately outside the Vitest glob, which
only takes `*.test.ts`. That is why these files carry the `.spec.ts` suffix that unit tests must not
use: the name is what keeps the two suites apart. `pnpm test:e2e` runs them, `playwright.config.ts`
starts the API and the web server, and they need a real database, which is why CI gives them their
own job with a Postgres service rather than folding them into `test`.

They cover the path, not the pixels: sign in through the demo entrance, create an offer, add a run,
see a price. Asserting what one component renders or does belongs in a `web`-project test beside
that component (see decision 5 and below), not here: an end-to-end test proves the whole path holds
together, never that one screen looks right.

### A Test Sets the Environment It Needs

A test file that depends on an environment variable sets it itself, at the top, as the auth tests do
with `process.env.JWT_SECRET = "test-secret"`. Nothing may rely on `packages/apps/api/.env`: it is
not in the repository, so it exists on the maintainer's machine and not on the runner. It reaches the
tests only by accident, because `@prisma/client` loads it when the client is constructed, and that
accident is what lets a suite pass locally and fail in CI on exactly the assertions that cover
misconfiguration.

### Tests Sit Beside Their Subject

A unit's test lives in the same folder, named `{name}.test.ts`. Only the HTTP integration test sits
apart, in `src/tests/`. No `.spec.ts`, no `__tests__` folders.

### Explicit Imports, One describe, `it`

Every file opens with `import { describe, expect, it } from "vitest"`; globals are not enabled.
Everything sits in a single top-level `describe` named after the function or the route, with no
nesting, and cases use `it`, never `test`.

```ts
describe("calculateBomPrice", () => {
  it("correctly sums the total price", () => { ... })
})
```

### Fixtures Come From the Domain Package

Test data is `componentCatalogMock` and `validOfferInput` from `packages/domain/src/fixtures`,
imported relatively inside the domain and through `@/domain/fixtures/*` from the API. Fixtures are
typed against production types, so a schema change breaks them at compile time rather than at run
time.

### Assert on the Whole Result, and on the Failure

Assertions compare the complete expected object with `toEqual`, or `toMatchObject` where only the
shape matters, rather than picking at individual fields. A unit that can fail gets both cases: one
that succeeds and one that throws or returns the error branch. Test names read as sentences about
behaviour, not about implementation.

### Two Vitest Projects: `node` and `web`

`vitest.config.ts` defines `test.projects`. `node` runs domain and API tests in a Node environment,
no JSDOM, exactly as before. `web` runs `packages/apps/web/**/*.test.{ts,tsx}` under JSDOM, set up by
`packages/apps/web/src/vitest.setup.ts` (currently just `@testing-library/jest-dom/vitest`, which
also has to be importable from that file for `tsc -b` to pick up its matcher types: the setup file
lives in `src/` for that reason, not beside `vitest.config.ts`). Coverage stays collected from
`packages/domain/**/*.ts` only; a `web` test is not measured against it (see decision 5).

### A Component Earns a Test the Way a Domain Function Does

Most UI stays covered only by using the app: it is thin forms and lists, and testing it would mostly
assert that React renders. A component gets a `.test.tsx` beside it only when it carries logic that
can fail quietly, the same bar domain code is held to, not because it is a component. A helper that
formats or describes a value (`formatPrice.test.ts`, `describeSaveState.test.ts`) needs no DOM at
all; a component whose buttons have to call the right prop (`confirm-dialog.test.tsx`) is rendered
with `@testing-library/react` and driven with `fireEvent`, never `@testing-library/user-event`,
which is not a dependency here. "Nothing is mocked" still holds: a callback under test is a plain
closure recording what it was called with, never `vi.fn()`.

Assert on behaviour the same way a domain test does: what text is on screen, what a click caused to
happen, never a snapshot and never a class name. A component that only renders props back out, with
no branch and no callback, still gets no test.

### The HTTP Layer Is Tested Through supertest

Endpoint tests build the app with `createApp` and injected fixtures and drive it with supertest,
asserting status and body across every branch the endpoint has. No test process touches Prisma or a
database, and the whole suite runs offline in about a second.

### A Domain Change Is Not Done Without a Test Change

Whenever domain logic changes, tests are added or updated in the same step, and `pnpm vitest run`
passes before the step is reported as finished.
