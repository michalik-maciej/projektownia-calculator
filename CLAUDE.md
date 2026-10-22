# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**Projektownia Calculator** is a monorepo for a full-stack offer calculation web application. It uses pnpm workspaces and Turborepo for managing multiple packages with shared domain logic.

### Purpose

The application calculates component requirements (bill of materials) for shelf configurations (wall layouts and gondola displays) and generates pricing offers with discounts.

## Package Dependencies

- **web** and **api** both consume **domain** and **schemas**
- **domain** consumes **schemas**
- **schemas** consumes nothing internal

These are **not** pnpm workspace dependencies. None of the packages lists the others in its
`package.json`. The wiring is done through path aliases, resolved separately at each stage, and all
three mechanisms have to agree:

| Stage          | Mechanism                                                             |
| -------------- | --------------------------------------------------------------------- |
| Type checking  | `paths` in `tsconfig.base.json` plus `references` for the build order |
| Web bundle     | `vite-tsconfig-paths` in `packages/apps/web/vite.config.ts`           |
| API at runtime | `module-alias` in `packages/apps/api/src/bootstrap.ts`                |

`bootstrap.ts` is the production entry point (`node dist/bootstrap.js`). It maps `@/domain` and
`@/schemas` onto the compiled `dist` folders and only then dynamically imports `./server`, because
the aliases must be registered before any module that uses them is loaded. Do not "simplify" that
file into a static import: it will break at runtime, and only in the built API, not in `tsx` dev.

Consequence: adding a shared package means touching `tsconfig.base.json`, the relevant
`references` and `bootstrap.ts`, not just running `pnpm add`.

## Commands

Run everything from the workspace root with `pnpm` (npm/yarn not supported). The scripts live in the
root `package.json`; `pnpm test:e2e` needs a database and installed browsers.

## Architecture & Domain Logic

### Domain layers (`packages/domain/`)

**Key Abstraction**:

- **Orchestrations** (public API): Accept user input, call domain functions, return `OfferOutput`
- **Transformations**: Pure data mapping (e.g., group demand by category, format descriptions)
- **Calculations**: Specific mathematical formulas (back panel area, foot quantity, etc.)
- **Models**: TypeScript types defining domain concepts

**Entry Point**: `createOfferPreview()` in orchestrations. This is called by the backend to generate preview offers.

### API (`packages/apps/api/`)

**Database** (Prisma):

- `User`: Email, hashed password, role (ADMIN/USER/DEMO)
- `Component`: Catalog inventory (category, dimensions, price)
- `Offer`: Offer records (input JSON, discount; pricing computed on every read, not stored), owned by the `User` that created
  them (`userId`, required), with the account that saved them last (`lastUpdatedById`, optional)
- `OfferShare`: Grants a user access to an offer they do not own (`offerId`, `userId`), set by an
  ADMIN

**API Endpoints**:

- `POST /api/auth/login`: Authenticate, return JWT cookie
- `POST /api/auth/demo`: Create a fresh session account (role DEMO, catalogue read-only), seeded with
  one priced example offer; expired demo accounts (24h+) are cleaned up as a side effect of this call
- `GET /api/inventory`: List components
- `POST /api/inventory`: Add component (ADMIN only)
- `PATCH /api/inventory/:id`: Update component (ADMIN only)
- `POST /api/offers`: Create offer (calls domain logic)
- `GET /api/offers`: List offers (the caller's own and those shared with them, unless they are an
  ADMIN)
- `GET /api/offers/:id/shares`: Users an offer is shared with (ADMIN only)
- `PUT /api/offers/:id/shares`: Replace the list of users an offer is shared with (ADMIN only)
- `POST /api/auth/register`: Create a user account (ADMIN only; this is how the user management
  dialog adds accounts, there is no public sign-up)
- `GET /api/users`: List accounts (ADMIN only; excludes role DEMO)
- `DELETE /api/users/:id`: Delete an account (ADMIN only; refuses to delete your own, 409 if the
  account still owns offers)
- `PUT /api/users/:id/password`: Reset an account's password (ADMIN only, no current password
  required)
- `GET /api/health`: Health check, returns `{ status, version, commit }` (version from the root
  `package.json`, commit baked into the Docker image at build time via `COMMIT_SHA`)

## Build & Deployment

### Backend Deployment (Fly.io)

The deploy is not manual, but it is not on every push either. The `deploy-api` job in
`.github/workflows/ci.yml` runs `flyctl deploy --remote-only` only on the push that merges the
Release Please PR (the `release-please` job reports `release_created`), once the `lint`, `build`,
`test` and `e2e` jobs are green for that commit, using the `FLY_API_TOKEN` repository secret.
Ordinary commits on `main` do not reach Fly.io until the next release is merged.

### Frontend Deployment (Vercel)

Configure Vercel to:

- Build command: `pnpm run build` (from root)
- Output directory: `packages/apps/web/dist`
- Install command: `pnpm install --frozen-lockfile`

## Code Quality Standards

### Comments

**Do not write inline comments.** Name things well and let the code say what it does. An inline
comment is justified only when the code cannot be understood without it: a non-obvious constraint, a
reason a line must stay exactly as it is, or a required directive such as `@ts-expect-error`.

When one is genuinely needed, keep it to **two lines at most**, and make it say _why_, never _what_.
No section banners, no restating the signature, no commented-out code.

**JSDoc is the exception.** A `/** ... */` block documenting an exported function, type or module is
not bound by the two-line limit and may take the room it needs, including `@param`, `@returns` and
an example. It still has to earn its place: document the contract, the assumptions and the surprises
of a public surface, not the mechanics of the body underneath it.

## Turborepo Task Orchestration

**`^build` in `turbo.json` is not enough here, and the per-package entries are not decoration.** Because no package
lists another in its `package.json` (see the package wiring section), Turbo sees four unrelated
packages and would run their builds in parallel. They are not unrelated: `tsc -b` in `api` and in
`web` both write `packages/schemas/dist` and `packages/domain/dist` through project references, so
two parallel builds race on the same files and fail with `TS6305` on a cold cache. That is why
`turbo.json` spells out `@projektownia-calculator/api#build` and `@projektownia-calculator/web#build`
depending on the domain and schemas builds, and why `domain` and `schemas` have `build` scripts of
their own.

For the same reason the API's build script is `prisma generate && tsc -b` and must not regain
`tsc -b --clean`: a clean run from `api` deletes the shared `schemas` and `domain` output that a
parallel `web` build is reading.

When adding tasks, consider:

- Include `.env*` in `inputs` if tasks read env vars (for cache invalidation)
- Set `cache: false` for persistent processes (dev servers)
- Use `^taskName` dependency for tasks needing upstream completion
- Add an explicit `{package}#{task}` edge whenever a task touches output owned by another package

## Environment Variables

### Backend (.env for Fly.io)

Required:

- `DATABASE_URL`: PostgreSQL connection string (Neon)
- `JWT_SECRET`: Secret for signing JWTs
- `WEBAPP_DOMAIN`: Frontend origin (CORS policy)

Optional: `PORT` (defaults to 3000). All of them are validated at startup by `parseEnv`
(`packages/apps/api/src/env.ts`); the process refuses to listen when one is missing or malformed.
`ALLOW_DEMO_SEED=1` is read by the seed only, and only where a demo account is wanted.

### Frontend

Frontend reads from environment at build time (Vite). Set in Vercel dashboard or `.env.local`:

- `VITE_API_URL`: Backend API endpoint

## Gotchas & Important Notes

1. **Workspace filtering**: Use `pnpm --filter @projektownia-calculator/api` to run commands on single packages. Without filter, commands run on all packages.

2. **Import aliases required**: When importing between packages, use `@/domain/*` and `@/schemas/*` aliases (defined in `tsconfig.base.json`). Relative imports like `../../src/*` are ESLint errors.

3. **Domain is backend-only**: Frontend cannot import from `@projektownia-calculator/domain`. This would include domain logic in the browser bundle. Call domain orchestrations via API endpoints only.

4. **Schemas are the contract**: All frontend-backend communication must be validated against Valibot schemas. Add new schemas to `packages/schemas/` before API changes.

5. **Prisma codegen**: Running `prisma generate` is required before building the API. This is included in the build script, but if you modify `schema.prisma`, run manually:

   ```bash
   pnpm --filter @projektownia-calculator/api run prisma generate
   ```

6. **TanStack Router auto-generation**: File-based routing in web generates `routeTree.gen.ts` automatically. Don't edit this file manually—place `.route.ts` files in `src/routes/`.

7. **Strict TypeScript**: All strict mode checks enabled. No implicit `any`, no unchecked index access. Type errors block builds.

## Git & SDLC Workflow

### Work Happens on `main`

There are no task branches and no pull requests. One maintainer works on one branch, commits land
directly on `main`, and the ceremony of branching, opening a pull request and merging it into your
own work bought nothing here.

The consequence is worth naming: CI (`.github/workflows/ci.yml`) runs on push to `main`, so it
reports on code that has already landed. It is a safety net, not a gate. The real gate is running
`pnpm validate` and `pnpm vitest run` locally before the commit.

A branch is still fine for something genuinely speculative that should not touch `main` until it
works. That is an exception the maintainer decides on, not a routine.

The one standing exception to "no pull requests" is the release PR that Release Please
(the `release-please` job in `.github/workflows/ci.yml`) keeps open and updates on every push to `main`: it proposes
the next SemVer version and a generated changelog from Conventional Commit messages. See decision 13
in `docs/decisions.md`. Merging it is still the maintainer's call, never the agent's, and it is what deploys the API.

### Commit Messages

Format: `{type}: {short description}`

Types follow Conventional Commits:

- `feat` — new feature
- `fix` — bug fix
- `refactor` — code change without behavior change
- `test` — adding or updating tests
- `chore` — tooling, config, dependencies
- `docs` — documentation only

```
feat: add gondola layout calculation
fix: adjust calculation logic for gondola shelves
refactor: extract offer price helper
```

### Trello Board

Part of the work is tracked at: https://trello.com/b/kgMgLeH1/kalkulator-metalu
The board is not complete, so no commit depends on a card existing and no card number appears in a
commit message.

### Development Workflow

**Work in small steps.** One concern per step: implement it, verify it, report, stop and wait
for the next instruction. Do not batch several unrelated fixes into one pass.

**Staging and committing belong to the user.** The workflow is:

1. **Leave changes in the working tree.** Do not run `git add`. The user reviews the diff file by
   file and stages what they accept.
2. **No branches, no commits, no pushes.** Work stays on `main` and stays in the working tree.
   Committing and pushing belong to the maintainer, without exception, tooling bookkeeping
   included. A `PreToolUse` hook (`.claude/hooks/block-agent-git-writes.mjs`) blocks every
   `git commit` and every `git push` the agent attempts, so this does not depend on the instruction
   being remembered. A branch is created only when the maintainer asks for one in that message.
3. **Propose, do not act.** When a commit is due, propose the message following the conventions
   above, then wait for the maintainer to make it.
4. **Verify every step** with `pnpm validate` and `pnpm vitest run`, and report plainly what passed
   and what did not. Say explicitly when something was checked statically only and not exercised in
   a running app.

**Problems noticed along the way**: list them at the end of the chat message, briefly and without
hedging. Do not fix them in the same step. Anything outside the current task becomes its own step,
and only after the user agrees to it.

### Definition of Done

Work lands directly on `main`. There is no review step and no second pair of eyes, so the checks
below are the only gate, and they have to be run before the commit rather than after it.

A step is done, from Claude's side, when:

1. The code does what the task asked, and nothing beyond it
2. `pnpm validate` passes (no TS errors, no lint errors, formatted, both apps build)
3. `pnpm vitest run` passes
4. Tests were added or updated if domain logic changed
5. The changes sit unstaged in the working tree and what was verified (and how) was reported

The task itself is done when the maintainer has reviewed the diff, staged it and committed it. That
step is never Claude's to take on its own.

## Resources & References

- **Decision Log**: `docs/decisions.md` (why the architecture is what it is; read it before
  changing package wiring, auth or how offers are persisted)
- **Trello Board**: https://trello.com/b/kgMgLeH1/kalkulator-metalu

## Project Documentation & Standards

Before starting a task, read `docs/INDEX.md` and then open the specific standard files it
points to that are relevant to the work at hand. The conventions in this file and in
`docs/decisions.md` take precedence wherever the two disagree.
