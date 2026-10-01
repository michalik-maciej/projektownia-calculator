# Decision log

Why this project is built the way it is. Each entry records the decision, the reason behind it and
what it costs, so that a later change is made deliberately rather than by accident.

## 1. A monorepo, because two deployment targets share the same rules

**Decision.** One pnpm workspace with four packages (`domain`, `schemas`, `apps/api`, `apps/web`),
orchestrated by Turborepo.

**Why.** The bill-of-materials rules and the shape of an offer are needed on both sides: the API
computes an offer, the browser builds and validates the form that produces it. Two repositories
would mean either publishing internal packages or copying the rules, and copied rules drift.

**Cost.** Build order has to be declared (`dependsOn: ["^build"]` in `turbo.json`, plus TypeScript
project `references`), and a change in `domain` invalidates the cache for everything downstream.

## 2. The domain package has no dependencies

**Decision.** `packages/domain` imports nothing except `packages/schemas`. No Express, no React, no
Prisma, no HTTP, no date library.

**Why.** This is the part of the system that is genuinely hard and genuinely worth keeping. The same
problem has been rebuilt four times (`projektownia-kalkulator`, `next-calculator`,
`remix-calculator`, and this one), and every rewrite replaced the framework while the rules stayed.
Keeping them in a package that depends on nothing is what let that happen.

The second payoff is testing: every rule is a plain function over plain data, so the tests need no
database, no HTTP server, no mocking and no test harness beyond Vitest.

**Cost.** Anything environmental (reading the inventory, persisting an offer, formatting for a
user) has to be handled by the caller. `createOfferPreview` receives the component inventory as an
argument instead of fetching it, which is exactly why it can be tested in a millisecond.

**Enforced by.** ESLint `no-restricted-imports` blocks reaching across packages with relative
paths. There is no automated check that the dependency list stays empty; keeping
`packages/domain/package.json` free of dependencies is a manual discipline.

## 3. Validation schemas are shared, not duplicated

**Decision.** Valibot schemas in `packages/schemas` are the single definition of an offer, a layout
and an inventory component. The API validates requests against them (`v.safeParse` in every
controller), the React forms validate input against them, and both sides derive their static types
from the same source with `v.InferOutput`.

**Why.** The alternative is a TypeScript interface on the client and a validator on the server,
which are the same statement written twice and free to drift. Here the shape cannot disagree,
because there is only one shape, and a change to it breaks the type check on both sides at once.

**Why Valibot.** The schemas run in two places: in Node during request handling, and inside the
browser bundle for form validation. That rules out anything Node-only and makes bundle weight a real
constraint, which is what Valibot's per-function API is built for.

**Cost.** The validation vocabulary is fixed across the whole system. Anything the schemas cannot
express has to be checked by hand, on both sides.

## 4. Packages are wired by path aliases, not workspace dependencies

**Decision.** No package lists another in its `package.json`. `@/domain/*` and `@/schemas/*` are
resolved by TypeScript `paths` in `tsconfig.base.json`, and separately at each stage:

| Stage          | Mechanism                                                   |
| -------------- | ----------------------------------------------------------- |
| Type checking  | `paths` plus `references` in each `tsconfig.json`           |
| Web bundle     | `vite-tsconfig-paths` in `packages/apps/web/vite.config.ts` |
| API at runtime | `module-alias` in `packages/apps/api/src/bootstrap.ts`      |

**Why.** The shared packages are never published and never versioned; they are compiled as part of
whatever consumes them. Aliases keep imports readable (`@/domain/orchestrations/...`) without a
publish step or a `workspace:*` protocol that would still need path mapping for the type checker.

**Cost.** Four mechanisms have to stay in agreement, and they fail at different times. The fourth is
Turborepo's task graph: with no package listing another, `^build` has nothing to order, so the
dependency has to be written out as `{package}#build` edges in `turbo.json`. Without them Turbo
builds `api` and `web` in parallel while both write the same `domain` and `schemas` output through
TypeScript project references, and CI fails on a cold cache with `TS6305` while a warm local machine
passes.

In particular the API's compiled output is CommonJS that Node cannot resolve on its own:
`bootstrap.ts` registers the aliases against the compiled `dist` folders and only then dynamically
imports `./server`. Turning that dynamic import into a static one breaks production startup while
leaving `tsx` dev mode working.

## 5. Tests sit in the domain layer

**Decision.** Tests live next to the code in `packages/domain`, with one integration test that
exercises the offer endpoint end to end (`packages/apps/api/src/tests/calculateOffer.test.ts`).
Coverage is collected from `packages/domain` only, as configured in `vitest.config.ts`. UI
components have no unit tests.

**Why.** The domain is where a mistake is both possible and expensive: a wrong upright count or a
mispriced back panel produces a plausible-looking offer that is quietly wrong. The components above
it are thin, mostly forms and lists, and testing them would mostly assert that React renders.

**Cost.** A regression in the UI is caught by using the app, not by the suite. That is an accepted
trade for a tool with one user and a maintainer who runs it.

**Amended 2026-09-15.** The rule stands for components, and one end-to-end test now sits above it:
`e2e/offer.spec.ts` drives a browser through the demo entrance, creates an offer, adds a run and
checks that it comes back priced. It exists because the trade above assumed a maintainer who opens
the app; a public demo is opened by people who will not report that it is broken. It is a smoke test
and stays one: it asserts that the whole path holds together, never how a component renders.

## 6. Authentication is a stateless JWT in an httpOnly cookie

**Decision.** Login signs a JWT (7-day expiry) and sets it as an `httpOnly`, `secure`,
`sameSite: "none"` cookie. There is no session table and no server-side session state.

**Why.** Stateless auth is what lets the API hold no memory between requests, which is what lets the
Fly machine stop entirely when nobody is using it (`min_machines_running = 0`,
`auto_stop_machines = 'stop'` in `fly.toml`). A session store would need somewhere to live and
would have to survive that. `sameSite: "none"` is required because the front end and the API are on
different sites (Vercel and Fly).

**Cost.** A token cannot be revoked before it expires. For a tool with a handful of known users that
is acceptable; it would not be for a multi-tenant product.

## 7. An offer stores its own output, not just its input

**Decision.** The `Offer` model persists both `input` and `output` as JSON
(`packages/apps/api/prisma/schema.prisma`).

**Why.** Component prices in the inventory change. If an offer were only its input, reopening one
from six months ago would recompute it against today's prices and silently show different numbers.
Storing the output makes an offer a record of what was quoted, not a query that happens to be
re-run.

**Cost.** A fix to the calculation rules does not propagate to offers already saved. That is the
point, but it means an old offer and a new one can legitimately disagree.

## 8. Vercel for the front end, Fly.io for the API

**Decision.** The web build is static output on Vercel. The API runs as a Docker image on Fly.io in
`ams`, 256 MB, scaling to zero, with migrations run as a release command
(`pnpm --filter @senior-calculator/api run migrate:deploy`). PostgreSQL is hosted on Neon.

**Why.** The two halves have different needs: the front end is static files best served from a CDN,
the API needs a real Node process and a database connection. Splitting them lets each scale to zero
and keeps the hosting cost of a single-user internal tool at nothing.

**Cost.** Cross-site cookies (see decision 6), a CORS origin that has to be configured
(`WEBAPP_DOMAIN`), and a cold start on the first request after the machine has stopped.

## 9. Strict TypeScript, including `noUncheckedIndexedAccess`

**Decision.** `strict: true` and `noUncheckedIndexedAccess: true` for every package
(`tsconfig.base.json`).

**Why.** The domain walks over arrays of shelf units and looks components up by index and by id.
`noUncheckedIndexedAccess` is what forces those lookups to admit they can miss, instead of producing
`undefined` typed as a `Component` and a `NaN` several steps later in the price.

**Cost.** More explicit guards in the calculation code. The alternative is discovering the missing
check in an offer sent to a customer.

## 10. A packaged agent harness was tried and dropped

**Decision.** The Maister plugin (`SkillPanel/maister`) was installed, used to derive the standards
now under `docs/standards/`, and run once end to end on a real feature (gondola support in the offer
configurator). The plugin has been removed: no marketplace entry, no enabled plugin, no `.maister/`
directory. The pilot's code was discarded unmerged, so the feature itself is not in the repository.
What is kept from the experiment is documentation only, plus the `PreToolUse` hook in
`.claude/hooks/block-agent-git-writes.mjs`, which predates the plugin and is not part of it.

**Why.** The parts worth keeping turned out to be the artifacts, not the machinery. Standards derived
from this repository's own code, the end client's requirements list and the prior art recovered from
three dead calculators are all useful on their own and needed no plugin to stay useful. The workflow
around them cost a directory of orchestrator state, a dashboard, per-task bookkeeping and a
thirteen-phase process for a repository with one maintainer working directly on `main`.

**Cost.** No packaged workflow to fall back on, so process discipline lives in `CLAUDE.md` and in
the standards rather than in tooling that enforces it. The bundled Playwright MCP goes with the
plugin, so browser verification has to be arranged separately when it is next needed. The pilot's
implementation was discarded, which means gondola support in the configurator remains unbuilt and
the seven task groups behind it would have to be redone; what survives of that work is the analysis,
not the code. The task's specification, implementation plan, work log, mockups and audit are no
longer in the working tree, but they are in commits `09b92e1` and `eceb46d` and can be read back
with `git show`.

## 11. An offer belongs to the user who created it

**Decision.** `Offer.userId` is required and carries a foreign key to `User`. Every offer endpoint
turns the caller's token into an `OfferScope` (`{ isAdmin, userId }`) and passes it to the
repository, which filters the list and every read by owner. An offer belonging to somebody else
answers 404, exactly as one that does not exist. A user with the `ADMIN` role is exempt and reaches
every offer, including for editing.

**Why.** An offer is a document one person prepares for one customer. With a shared list, everybody
sees quotes they did not write and can open, edit or delete them, and the autosave makes that damage
silent. The component inventory stays common, because a price list is the company's, not the
author's. 404 rather than 403 because an id alone should not confirm that an offer exists.

**Cost.** Nothing hands an offer over to a colleague: there is no sharing, and no endpoint changes
the owner, which is why `UpdateOfferInput` excludes `userId`. Offers that predated the column could
not be attributed to anybody and were deleted by migration
`20260910120000_clear_offers_before_owner`. An ADMIN sees foreign offers in the list with no sign of
whose they are, because a summary carries only a title and a date.

**Enforced by.** `packages/apps/api/src/tests/offerOwnership.test.ts` drives every offer route as an
owner, as a stranger and as an admin. To make that possible without a database, the offer repository
became an injected dependency (`createApp({ offers })`), the way the inventory already was, and the
five offer controllers became factories assembled by `offerControllers`.

## 12. The demo is a role, not an environment

**Decision.** Visitors reach the application through a `Demo` button on the login screen, which calls
`POST /api/auth/demo` and creates a fresh account with the `DEMO` role on every call. That role may
do everything an ordinary account may, except write to the component catalogue. There is no separate
database, no separate API and no separate deployment.

**Why.** The alternative that was designed first was a third Neon branch with its own Fly app and its
own front end. It is the safer shape and it was rejected deliberately: it triples the number of
places a change has to be applied, for a product with one commercial user. Making the demo a role
instead costs one enum value, one guard and one endpoint, and it keeps the demo on exactly the code
path that real users are on, which is also what makes the demo honest.

The catalogue is the only shared thing anyone can write, which is why it is the only thing the role
takes away. Offers already belong to their author (decision 11), so a visitor cannot see or damage
anybody else's work. That guarantee only holds between visitors if they are not also sharing the same
account, which is why `/demo` creates one rather than finding-or-creating a single standing account:
a shared account would let two visitors land in the same workspace and overwrite each other through
autosave, the one failure mode decision 11 cannot prevent on its own.

**Cost.** A visitor sees the real component catalogue, prices included, because pricing an offer
needs it. Demo offers are written into the production database alongside real ones, distinguishable
only by their owner. `User` gains one row per visitor instead of one in total; `deleteExpiredDemoAccounts`
removes accounts (and their offers) older than 24 hours as a side effect of the next `/demo` call
rather than a scheduled job, so a repo nobody visits keeps its last visitors' rows until someone opens
the demo again. The admin's user list filters role `DEMO` out, or it would fill with them. Each of
these is the price of not running a second environment, and each is reversible: a separate branch and
deployment is still possible later without changing this code, because the role travels with the
account.
