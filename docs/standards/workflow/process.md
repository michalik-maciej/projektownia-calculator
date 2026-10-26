## Working Process

### One Concern per Step

A step implements one thing, verifies it, reports and stops for the next instruction. Unrelated
fixes are not batched into the same pass, however tempting the detour looks while the file is
already open.

### Problems Are Reported, Not Quietly Fixed

Anything noticed along the way is listed briefly at the end of the message, without hedging, and left
alone. It becomes its own step, and only after the maintainer agrees to it.

### Verify With pnpm validate and pnpm vitest run

Every step is checked with `pnpm validate` (typecheck, lint, format check, build) and
`pnpm vitest run`, and the report says plainly what passed and what did not. CI splits the same work
across separate jobs, but locally these two commands are the whole gate. When something was only
checked statically and
never exercised in a running app, say so in those words. A frontend change is not verified until it
has been opened in a browser.

### What Green Means Here

CI runs six jobs. Four checks run in parallel, each on its own runner, each repeating checkout,
Node, pnpm and `pnpm install --frozen-lockfile` before doing its own work: `lint` runs `pnpm lint`
and `pnpm format:check`, `build` runs `pnpm build`, `test` runs `pnpm vitest run`, and `e2e` drives
a browser against a real database. Alongside them, `release-please` updates the release PR. The
sixth, `deploy-api`, waits on all five. The workflow also declares a `pull_request` trigger, which
never fires: the only pull request here is the release PR, and Release Please opens it with
`GITHUB_TOKEN`, whose events do not start other workflows.

There is no separate typecheck job, and that is deliberate rather than an oversight. `pnpm build`
runs `tsc -b` in the API and the web app, and TypeScript project references make that walk into
`domain` and `schemas` as well, so the build already typechecks every package. The API's build also
runs `tsc -p prisma`, which checks `prisma/seed.ts` without emitting, since the seed sits outside
`src` and the emitting build must keep `rootDir` there. A typecheck job would compile the same code a
second time.

The `test` job generates the Prisma client itself before running Vitest. Its runner is a fresh
machine that has never run a build, and `createApp` imports `@prisma/client` through the repository
layer, so without that step the suite fails on an ungenerated client.

So CI reports on code that is already on `main`. It catches what a machine other than this one sees,
which is worth having, but it is a net rather than a gate. Splitting one job into four makes a
failure easier to read and lets a single job be rerun, but it does not turn CI into a gate. The gate
is running `pnpm validate` and `pnpm vitest run` locally, before the commit.

`deploy-api` runs `flyctl deploy --remote-only` after `lint`, `build`, `test` and `e2e` all pass,
and only on the push that merges the Release Please PR: it waits on the `release-please` job and
runs when that job reports `release_created`. Ordinary pushes run the checks but do not deploy. It
exists because Fly.io, unlike Vercel, has no integration that deploys on its own. Vercel still
redeploys the front end on every push, so between releases the front end can be ahead of the API.
A single `deploy-api` concurrency group keeps two deploys from running the migration release
command at the same time.

Two things are worth knowing about. No CI job runs `pnpm validate` itself, it runs the pieces, so the
local command and the remote checks can drift apart if one is changed without the other. And the
build is a compile check, not a rehearsal of the real one: neither the CI runner nor a bare checkout
has a `VITE_API_URL`, so the bundle it produces is thrown away and only Vercel's build makes a bundle
that runs. `validate` also writes to `dist/`, which no other check does.

### The Toolchain Version Lives in Three Places

Node 24 is pinned in `engines.node`, in the CI `setup-node` step and in the API `Dockerfile`; pnpm
9.0.0 comes from the `packageManager` field and is read by both CI and the Docker build. Changing the
version means changing all of them together.

### The Test Job Enforces Coverage

CI runs `pnpm test:coverage`, not a bare `vitest run`, so the thresholds in `vitest.config.ts`
(measured over `packages/domain` only) fail the
build rather than being reported and ignored. They sit below what the suite currently reaches, deliberately
loosely: the point is to catch a change that guts the domain tests, not to make every ordinary commit
negotiate with a percentage.

### The Unit Suite Has No Database, the End-to-End Job Has One

The `build` and `test` jobs set a deliberately unusable `DATABASE_URL`, purely so `prisma generate`
can run. There are no service containers and no secrets in either of them, so every unit and HTTP
test must be pure or take its collaborators by injection.

The `e2e` job is the exception and is separate for exactly that reason: it runs a Postgres service,
applies the migrations, seeds the catalogue and drives a browser. Keeping it apart is what stops the
fast suite from growing a database dependency by accident. `deploy-api` waits for it along with the
other three. The one secret the workflow uses, `FLY_API_TOKEN`, belongs to `deploy-api` and never
reaches a test.

### Read the Decision Log Before Touching the Foundations

`docs/decisions.md` records why the architecture is what it is, and what each choice costs. Read it
before changing package wiring, authentication or how offers are persisted, so that a change is made
deliberately rather than by accident.

### Review Runs on Two Rhythms, Not per Commit

Commits land on `main` without review. Code is reviewed instead at two fixed points, and everything
either of them finds goes to `docs/review/findings.md`.

Before the release PR is merged, the range from the previous release tag to `main` is reviewed
against `docs/standards/` and `docs/decisions.md`, with a security pass when the range touches auth
or the API. The release tag is the record of what has been reviewed. A finding that would break
production blocks the merge, the rest are triaged.

Once a week one area is audited as it stands, not as a diff, because drift between modules and
between code and documentation never shows up in a single change. The areas rotate in this order:

| Area                  | Scope                                               | Last audit |
| --------------------- | --------------------------------------------------- | ---------- |
| Domain                | `packages/domain`                                   | 2026-10-26 |
| API: auth and sharing | `packages/apps/api`                                 | never      |
| Web                   | `packages/apps/web`: components and data fetching   | never      |
| Documentation vs code | `CLAUDE.md`, `docs/`                                | never      |
| Build and CI          | `tsconfig*.json`, `turbo.json`, `.github/workflows` | never      |

Every finding is triaged as fixed, deferred or rejected, and a rejected one keeps its reason so the
next review does not raise it again. Each fix is its own step and its own commit, which also updates
the finding's status. The audit that completes an area updates its date in the table above.
