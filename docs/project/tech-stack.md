# Technology Stack

## Overview

Technology choices for Projektownia Calculator, a pnpm + Turborepo monorepo with four packages: `domain`,
`schemas`, `apps/api` and `apps/web`. The rationale behind the structural choices is recorded in
`docs/decisions.md`; this document lists what is actually in use.

## Languages

### TypeScript 5.9.2

- **Usage**: all application code, front end and back end
- **Rationale**: one language across the stack lets the domain rules and the validation schemas be
  written once and consumed by both sides
- **Key features used**: `strict: true` and `noUncheckedIndexedAccess`, composite project references,
  path aliases (`@/domain/*`, `@/schemas/*`), target ES2022

## Frameworks

### Frontend

- **React 19** with **Vite 5**
- **TanStack Router 1.157**: file-based routing, `routeTree.gen.ts` is generated and never edited by
  hand
- **TanStack Query 5.90**: server state, caching, refetching
- **React Hook Form 7.71**: form state, validated against the shared Valibot schemas
- **Radix UI 1.4** primitives styled with **Tailwind CSS 4.1** (via `@tailwindcss/vite`)
- All user-facing text is written in Polish

### Backend

- **Express 5.2**: routers created by factory functions, thin controllers per action
- **Prisma 5.22**: data access and migrations
- **jsonwebtoken 9.0** and **bcryptjs 3.0**: stateless auth, JWT in an httpOnly cookie, no session
  store (decision 6)

### Testing

- **Vitest 4.0** in a Node environment, no JSDOM
- **supertest 7.1** for the one end-to-end API test

## Database

### PostgreSQL (hosted on Neon)

- **Type**: relational
- **ORM**: Prisma, migrations applied as a Fly.io release command
- **Models**: `User`, `Component`, `Offer` (the offer persists both its input and its output as JSON)

## Build Tools & Package Management

- **pnpm 9.0** workspaces, **Turborepo 2.6.3** for task orchestration and caching
- Build order is declared, not inferred: `dependsOn: ["^build"]` plus TypeScript `references`
- Packages are wired by path aliases rather than workspace dependencies, resolved separately by
  TypeScript, by `vite-tsconfig-paths` in the web bundle, and by `module-alias` in
  `packages/apps/api/src/bootstrap.ts` at runtime (decision 4)

## Infrastructure

### Containerization

Multi-stage `Dockerfile` for the API (deps, build, runner).

### CI/CD

GitHub Actions (`.github/workflows/ci.yml`): three parallel jobs, `lint` (`pnpm lint` and
`pnpm format:check`), `build` (`pnpm build`, which typechecks every package through project
references) and `test` (`prisma generate`, then `pnpm vitest run`), followed by a `deploy-api` job
running `flyctl deploy --remote-only`. All fire on push to `main`, which is where all work lands, and
`deploy-api` runs only there and only once the other three are green. The workflow also declares a
`pull_request` trigger, kept but dormant, since the repository does not use pull requests. Deploying
the API needs a `FLY_API_TOKEN` repository secret.

### Hosting

- **Front end**: Vercel, static output from `packages/apps/web/dist`
- **API**: Fly.io in `ams`, 256 MB, scaling to zero (`min_machines_running = 0`)
- **Database**: Neon

## Development Tools

### Linting & Formatting

- **ESLint 9.18** with **typescript-eslint 8.19** and **eslint-plugin-simple-import-sort**
  (three-tier import groups, no relative imports across packages, unused variables must be
  `_`-prefixed)
- **Prettier 3.7**: 80 character width, 2-space indentation, no semicolons, trailing commas

### Type Checking

`pnpm typecheck` through Turborepo; `pnpm validate` runs typecheck, lint, format check and build
together.

## Key Dependencies

- **Valibot 1.2**: the single definition of every data shape crossing the API boundary, used for
  runtime validation on both sides and as the source of the static types via `v.InferOutput`. Chosen
  over heavier validators because the same schemas ship inside the browser bundle (decision 3).
- **lodash/fp**, **clsx**, **tailwind-merge**, **lucide-react**, **sonner** on the front end.

## Version Management

Versions are pinned in `package.json` per package and locked by `pnpm-lock.yaml`. The pnpm version
itself comes from the `packageManager` field and is read by CI.

---

_Last Updated_: 2026-09-07
_Auto-detected_: all versions and tooling, from package manifests and configuration files
_User-provided_: none
