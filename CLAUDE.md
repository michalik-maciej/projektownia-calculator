# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**Projektownia Calculator** is a monorepo for a full-stack offer calculation web application. It uses pnpm workspaces and Turborepo for managing multiple packages with shared domain logic.

### Purpose

The application calculates component requirements (bill of materials) for shelf configurations (wall layouts and gondola displays) and generates pricing offers with discounts.

## Monorepo Structure

```
packages/
├── apps/
│   ├── api/          # Express backend (Node.js)
│   └── web/          # React frontend (Vite)
├── domain/           # Core business logic & domain models
└── schemas/          # Valibot schemas for runtime validation
```

### Package Dependencies

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

## Tech Stack

| Component        | Technology                                       |
| ---------------- | ------------------------------------------------ |
| Frontend         | React 19 + Vite + TypeScript                     |
| Backend          | Express + TypeScript + Prisma ORM                |
| Database         | PostgreSQL (Neon)                                |
| Validation       | Valibot (runtime + static types)                 |
| Styling          | Tailwind CSS v4                                  |
| Routing          | TanStack Router v1                               |
| State Management | TanStack Query (React Query)                     |
| Auth             | JWT (stateless, cookies)                         |
| Monorepo         | pnpm v9.0.0 + Turborepo v2.6.3                   |
| Build/Type Check | TypeScript v5.9.2 (composite project references) |
| Linting          | ESLint v9 + TypeScript ESLint                    |
| Formatting       | Prettier (80 char line width, 2-space tabs)      |
| Testing          | Vitest (Node.js environment)                     |
| Deployment       | Fly.io (API, Docker), Vercel (Frontend)          |

## Development Commands

**All commands run from the workspace root.** Use `pnpm` exclusively (npm/yarn not supported).

### Core Commands

```bash
# Install dependencies (run after git pull or package.json changes)
pnpm install

# Development servers (runs api + web in parallel)
pnpm dev              # All packages in watch mode
pnpm dev:api          # Only backend (port 3000)
pnpm dev:web          # Only frontend (port 5173)
pnpm dev:local        # Both local services (api + web)

# Build
pnpm build            # Build all packages respecting dependency order

# Code quality
pnpm lint             # ESLint all packages
pnpm typecheck        # TypeScript type checking
pnpm format           # Format with Prettier + fix ESLint
pnpm format:check     # Check formatting without modifying
pnpm validate         # Full validation: typecheck + lint + format:check + build

# Testing
pnpm test             # Run all tests in watch mode
pnpm test:watch       # Alias for pnpm test
pnpm test:coverage    # Generate coverage report (includes domain/ only)
pnpm test:e2e         # Playwright smoke test (needs a database and installed browsers)
```

### Per-Package Commands

Use `pnpm --filter <package-name>` to run commands on a single package:

```bash
# Examples:
pnpm --filter @projektownia-calculator/api run dev
pnpm --filter @projektownia-calculator/web run build
pnpm --filter @projektownia-calculator/schemas run lint
pnpm --filter @projektownia-calculator/domain run test
```

### TypeScript Project References

The monorepo uses composite TypeScript projects. Incremental builds are cached:

```bash
# Clean and rebuild TypeScript
pnpm --filter @projektownia-calculator/api run build
# Internally runs: tsc -b --clean && tsc -b
```

## Architecture & Domain Logic

### High-Level Flow

1. **Frontend (web)**: User configures shelf layouts (wall or gondola type) with dimensions
2. **Validation**: Input validated against schemas in `packages/schemas/`
3. **Backend Calculation (domain)**: Core orchestration logic in `packages/domain/`
4. **Output**: Component requirements (BOM), pricing, and layout descriptions
5. **Persistence**: Offers saved to PostgreSQL via Prisma

### Core Packages

#### `packages/schemas/` (Valibot Schemas)

Runtime validation schemas shared between frontend and backend. Each schema exports:

- Valibot schema object (`v.object()`, `v.array()`, etc.)
- TypeScript type via `v.InferOutput<typeof Schema>`

Key schemas:

- `Offer.schema.ts`: Input/output structure for offers
- `auth/`: Login, JWT payload, authenticated user
- `inventory/`: Component CRUD operations
- `LayoutWall.schema.ts`, `LayoutGondola.schema.ts`: Layout type definitions

**Principle**: Schemas are the single source of truth for data structure contracts between frontend and backend.

#### `packages/domain/` (Business Logic)

Pure TypeScript functions organized by abstraction layer:

```
src/
├── models/              # Domain types (Component, ShelfUnit, etc.)
├── fixtures/            # Test data (componentCatalog, validOfferInput)
├── calculations/        # Low-level computations
│   └── calculate{X}Demand/  # Individual component demand
├── transformations/     # Medium-level data transformations
│   ├── breakdownDemandByCategory/
│   ├── buildLayoutDescription/
│   └── mapLayoutsToOfferOutput/
└── orchestrations/      # High-level business workflows
    ├── createOfferPreview/      # Main entry point: input → OfferOutput
    ├── calculateOfferDemand/    # BOM aggregation
    ├── calculateWallLayoutDemand/
    └── calculateGondolaLayoutDemand/
```

**Key Abstraction**:

- **Orchestrations** (public API): Accept user input, call domain functions, return `OfferOutput`
- **Transformations**: Pure data mapping (e.g., group demand by category, format descriptions)
- **Calculations**: Specific mathematical formulas (back panel area, foot quantity, etc.)
- **Models**: TypeScript types defining domain concepts

**Entry Point**: `createOfferPreview()` in orchestrations. This is called by the backend to generate preview offers.

#### `packages/apps/api/` (Express Backend)

```
src/
├── app.ts              # Express setup (middleware, routes)
├── server.ts           # HTTP server startup
├── bootstrap.ts        # Entry point (node dist/bootstrap.js)
├── routes/
│   ├── health.routes.ts
│   ├── auth.routes.ts
│   ├── inventory.routes.ts
│   ├── offers.routes.ts
│   └── users.routes.ts
├── controllers/        # Route handlers
└── db/                 # Prisma client, migrations
```

**Database** (Prisma):

- `User`: Email, hashed password, role (ADMIN/USER/DEMO)
- `Component`: Catalog inventory (category, dimensions, price)
- `Offer`: Offer records (input JSON, output JSON, discount), owned by the `User` that created
  them (`userId`, required)

**API Endpoints**:

- `POST /api/auth/login`: Authenticate, return JWT cookie
- `POST /api/auth/demo`: Create a fresh session account (role DEMO, catalogue read-only), seeded with
  one priced example offer; expired demo accounts (24h+) are cleaned up as a side effect of this call
- `GET /api/inventory`: List components
- `POST /api/inventory`: Add component
- `PATCH /api/inventory/:id`: Update component
- `POST /api/offers`: Create offer (calls domain logic)
- `GET /api/offers`: List offers (only the caller's own, unless they are an ADMIN)
- `POST /api/auth/register`: Create a user account (ADMIN only; this is how the user management
  dialog adds accounts, there is no public sign-up)
- `GET /api/users`: List accounts (ADMIN only; excludes role DEMO)
- `DELETE /api/users/:id`: Delete an account (ADMIN only; refuses to delete your own, 409 if the
  account still owns offers)
- `PUT /api/users/:id/password`: Reset an account's password (ADMIN only, no current password
  required)
- `GET /api/health`: Health check

#### `packages/apps/web/` (React + Vite Frontend)

```
src/
├── index.tsx           # React root
├── routeTree.gen.ts    # Auto-generated TanStack Router routes
├── routes/             # Route definitions
├── app/                # App layout & components
├── core/               # Utilities, API client, hooks
├── user/               # Auth flows (login, logout)
├── inventory/          # Component management UI
├── layout/             # Layout builder (wall/gondola)
├── offer/              # Offer preview & history
└── index.css           # Tailwind + custom styles
```

**Key Libraries**:

- **TanStack Router**: Type-safe file-based routing with auto-generated `routeTree.gen.ts`
- **TanStack Query**: Server state management, caching, refetching
- **React Hook Form**: Form state and validation
- **Radix UI**: Headless UI components styled with Tailwind

**Data Flow**: User input → Valibot validation → API call → Domain orchestration → UI update

### How Domain Logic Works (Example)

When calculating an offer:

1. **Input**: User provides layout configurations (wall or gondola with dimensions), components from inventory
2. **`createOfferPreview()`** orchestration:
   - Calls `calculateOfferDemand()` → aggregates component requirements across all layouts
   - Calls `breakdownDemandByCategory()` → groups demand by component category
   - Calls `mapLayoutsToOfferOutput()` → formats layout descriptions
   - Calls `calculateBomPrice()` → sums component costs, applies discount
3. **Output**: `OfferOutput` object with breakdown, layouts, pricing ready to send to frontend

Each calculation function is isolated, testable, and reusable.

## Build & Deployment

### Local Build

```bash
pnpm build              # Builds all: domain → schemas → api → web
```

**Output**:

- `packages/domain/dist/`: CommonJS modules
- `packages/schemas/dist/`: CommonJS modules
- `packages/apps/api/dist/`: Node.js binary (Node.js entry: `dist/bootstrap.js`)
- `packages/apps/web/dist/`: Static files for Vercel

### Backend Deployment (Fly.io)

`fly.toml` deploys `packages/apps/api` via Docker:

```bash
# Docker builds from Dockerfile (multi-stage):
# 1. deps: Install workspace dependencies
# 2. build: Run pnpm turbo build --filter=@projektownia-calculator/api
# 3. runner: Minimal production image (Node.js + prisma deps only)

# On deploy: Release command runs migrations
# pnpm --filter @projektownia-calculator/api run migrate:deploy
```

The deploy is not manual. The `deploy-api` job in `.github/workflows/ci.yml` runs
`flyctl deploy --remote-only` on every push to `main` once the `lint`, `build` and `test` jobs are
green, using the `FLY_API_TOKEN` repository secret.

### Frontend Deployment (Vercel)

Configure Vercel to:

- Build command: `pnpm run build` (from root)
- Output directory: `packages/apps/web/dist`
- Install command: `pnpm install --frozen-lockfile`

## TypeScript Configuration

### Composite Projects

Root `tsconfig.json` references all packages:

```json
{
  "files": [],
  "references": [
    { "path": "./packages/domain" },
    { "path": "./packages/schemas" },
    { "path": "./packages/apps/api" },
    { "path": "./packages/apps/web" }
  ]
}
```

### Base Config (`tsconfig.base.json`)

Extended by all packages. Key settings:

- **Target**: ES2022
- **Module**: ESNext (bundler resolution)
- **Strict**: true (strict null checks, explicit any, etc.)
- **Path aliases**:
  - `@/domain/*` → `packages/domain/src/*`
  - `@/schemas/*` → `packages/schemas/src/*`

Use these aliases for imports across packages:

```typescript
import { createOfferPreview } from "@/domain/orchestrations/createOfferPreview"
import { OfferInput } from "@/schemas/Offer.schema"
```

### Per-Package Overrides

- **web**: `jsx: "react-jsx"`, `noEmit: true` (Vite handles bundling)
- **api**: `module: "CommonJS"`, `outDir: "dist"` (Node.js deployment)
- **domain** & **schemas**: CommonJS for Node.js consumption

## Frontend Conventions

### Language

All user-facing text in the frontend (labels, placeholders, button text, error messages, legends, headings, empty states) must be written in **Polish**. This applies to every `.tsx` file under `packages/apps/web/src/`.

## Code Quality Standards

### ESLint Rules

Enforced across all packages:

- **Import sorting**: 3-tier groups (3rd-party → internal aliases → relative)
  ```typescript
  import express from "express" // 3rd-party
  import { createOfferPreview } from "@/domain" // @/ aliases
  import { helper } from "./utils" // Relative
  ```
- **Unused variables**: Error unless prefixed with `_`
- **No nested ternaries**: Error (`no-nested-ternary`); three or more branches go into a named
  function with early returns
- **No relative imports outside package**: Error (use aliases instead)
  ```typescript
  // ❌ Bad: import { Component } from "../../src/models"
  // ✅ Good: import { Component } from "@/domain/models"
  ```

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

### Prettier Configuration

- Line width: 80 characters
- Tab width: 2 spaces
- Trailing commas: Always
- Semicolons: None

```bash
pnpm format              # Auto-fix all files
pnpm format:check        # Verify formatting
```

### TypeScript Strict Mode

All packages compile with strict mode enabled. Checks enforced:

- Explicit types required (no implicit `any`)
- Null/undefined checks
- Property existence validation
- `noUncheckedIndexedAccess`: Requires index type guards

## Testing

### Vitest Configuration

Defined in `vitest.config.ts` (workspace root) as two `test.projects`:

- **`node`**: domain and API tests, Node.js environment, no JSDOM. Files:
  `packages/**/**/*.test.ts` (excluding `packages/apps/web`), `tests/**/*.test.ts`
- **`web`**: component and helper tests, JSDOM environment, React Testing Library. Files:
  `packages/apps/web/**/*.test.{ts,tsx}`, set up by `packages/apps/web/src/vitest.setup.ts`
- **Coverage**: Collected from `packages/domain/**/*.ts` only, unaffected by the `web` project

### Running Tests

```bash
pnpm test               # Watch mode
pnpm test:watch         # Explicit watch
pnpm test:coverage      # Generate coverage report (html output)
```

### Test Location & Naming

Place tests next to source:

```
src/calculations/calculateBomPrice/
├── calculateBomPrice.ts
└── calculateBomPrice.test.ts
```

Use `.test.ts` suffix (`.test.tsx` for a component under `packages/apps/web`), picked up by the
glob pattern of the matching `test.projects` entry in `vitest.config.ts`.

## API Clients & Integration

### Backend → Domain

```typescript
// In api controller:
import { createOfferPreview } from "@/domain/orchestrations/createOfferPreview"

const offerOutput = createOfferPreview(parsedInput, componentInventory)
```

### Frontend → Backend

Use TanStack Query hooks:

```typescript
const { data, isLoading } = useQuery({
  queryKey: ["offers"],
  queryFn: () => fetch("/api/offers").then((r) => r.json()),
})
```

Form submissions to API endpoints use React Hook Form + Valibot validation.

### Frontend → Domain

Domain logic is backend-only. Frontend cannot import from `@projektownia-calculator/domain` (would break browser bundle). Use API endpoints to trigger calculations.

## Turborepo Task Orchestration

Key Turbo settings in `turbo.json`:

- **`build`**: `dependsOn: ["^build"]` (dependencies build first)
- **`lint`**, **`typecheck`**: `dependsOn: ["^lint"]`, `dependsOn: ["^typecheck"]`
- **`dev`**: `cache: false, persistent: true` (no caching, runs indefinitely)

**`^build` is not enough here, and the per-package entries are not decoration.** Because no package
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

## Common Workflows

### Adding a New Calculation

1. Create `packages/domain/src/calculations/calculate{X}/{name}.ts`
2. Export pure function with single responsibility
3. Add adjacent `.test.ts` with test cases
4. Export from domain's entry point if needed by orchestrations
5. Call from appropriate orchestration layer

### Adding a New API Endpoint

1. Create schema in `packages/schemas/src/{feature}/` if needed
2. Add Prisma model migration (if data persistence required)
3. Add route handler in `packages/apps/api/src/routes/{feature}.routes.ts`
4. Call domain logic from controller
5. Return validated output (validate against Valibot schema before sending)

### Updating Domain Models

Models live in `packages/domain/src/models/`. Changes:

1. Update TypeScript type
2. Update dependent tests
3. Update downstream transformations/orchestrations
4. Update corresponding Valibot schemas in `packages/schemas/`

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

Before starting a task, read @docs/INDEX.md and then open the specific standard files it
points to that are relevant to the work at hand. The conventions in this file and in
`docs/decisions.md` take precedence wherever the two disagree.
