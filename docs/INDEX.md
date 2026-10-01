# Documentation Index

**IMPORTANT**: Read this file at the beginning of any development task to understand available documentation and standards.

## Quick Reference

### Project Documentation

Project-level documentation covering vision, goals, architecture, and technology choices.

### Technical Standards

Coding standards, conventions, and best practices organized by domain: global, frontend, backend, testing, workflow.

> **Note on precedence**: this repository also maintains a hand-written `CLAUDE.md` at the root and a decision log at `docs/decisions.md`. The standards below were derived from this repository's own code and documentation, so they should agree with those files. Where they genuinely conflict, `CLAUDE.md` and `docs/decisions.md` win, and the standard that disagrees is the one to correct.

---

## Project Documentation

Located in `docs/project/`

### Vision (`project/vision.md`)

What Projektownia Calculator is for and where it is going: turning wall and gondola shelf configurations into a bill of materials and a priced offer, why offers store the output they were quoted at rather than being recomputed, the current state of the repository (age, single maintainer, one commercial user), and the goals for the next 6 to 12 months (a scale-drawing configuration UI, the missing run configuration form, the end client's backlog with gondolas first). Also records that the calculation rules have survived four rewrites, which is why they live in a dependency-free package.

### Tech Stack (`project/tech-stack.md`)

The technology actually in use, with versions: TypeScript 5.9.2 under `strict` and `noUncheckedIndexedAccess`, React 19 + Vite with TanStack Router and Query, Express 5 + Prisma 5 on PostgreSQL (Neon), Valibot as the single definition of every shape crossing the API boundary, Vitest in a Node environment, pnpm 9 workspaces with Turborepo 2.6.3, ESLint 9 and Prettier, GitHub Actions CI, and hosting on Vercel (web) and Fly.io (API). Notes the path-alias wiring resolved separately by TypeScript, `vite-tsconfig-paths` and `module-alias`.

### Architecture and decisions: not duplicated here

There is deliberately no `project/architecture.md` and no `project/roadmap.md` in this directory. Architecture is already documented authoritatively by the repository's own files, and a second copy would only drift out of step with them:

- `CLAUDE.md` (repository root): monorepo structure, package wiring and the three alias mechanisms that must agree, tech stack, commands, the domain layering (models, calculations, transformations, orchestrations), API surface, code quality rules, and the git/SDLC workflow
- `docs/decisions.md`: the decision log explaining why the architecture is what it is. Read it before changing package wiring, auth or how offers are persisted.

Treat those two files as the architecture documentation for this project. This is a standing choice, not a gap waiting to be filled.

---

## Technical Standards

### Global Standards

Located in `docs/standards/global/`

These standards apply across the entire codebase, regardless of frontend/backend context.

#### Coding Style (`standards/global/coding-style.md`)

Prettier settings that are not negotiable, three-tier import grouping, aliases across packages with relative paths inside one, named exports, function declarations for exported functions, `type` over `interface`, giving numbers names, guarding index access instead of asserting it away, lodash/fp in domain and API against native methods in web, no nested ternaries, descriptive names and focused functions, no dead code.

#### Commenting (`standards/global/commenting.md`)

No inline comments, two lines at most and say why rather than what, JSDoc as the one exception for public surfaces, no change-log comments in source.

#### Conventions (`standards/global/conventions.md`)

pnpm only and from the workspace root, predictable structure, environment variables validated once at startup so the process refuses to serve traffic misconfigured, minimal dependencies, building only what is needed, documentation that follows the code.

#### Error Handling (`standards/global/error-handling.md`)

The domain throws typed errors and the edge maps them, unexpected errors logged with a prefix and answered generically, every response naming its status, handling at the boundary, failing fast.

#### Minimal Implementation (`standards/global/minimal-implementation.md`)

Generic baseline, kept as written: build what you need, clear purpose per unit of code, delete exploration artifacts, no future stubs, no speculative abstractions, review before commit, unused code is debt.

#### Validation (`standards/global/validation.md`)

Valibot schemas as the contract, schemas that compose rather than repeat, validation at the controller boundary as the first statement, server-side always with client-side only for feedback, specific field-level messages.

---

### Frontend Standards

Located in `docs/standards/frontend/`

These standards apply to frontend code (UI components, client-side logic, styling, data fetching).

#### Accessibility (`standards/frontend/accessibility.md`)

Generic baseline, kept as written: semantic HTML, keyboard navigation, color contrast, alt text and labels, screen reader testing, ARIA only when needed, heading structure, focus management.

#### Components (`standards/frontend/components.md`)

Organised by feature rather than by layer, PascalCase feature folders and kebab-case primitives, props inline, destructured and alphabetical, forms on React Hook Form shared through context, routes exporting `Route` with the component below, the browser bundle never importing domain code, single responsibility and minimal props.

#### CSS (`standards/frontend/css.md`)

Generic baseline, kept as written: consistent methodology, working with the framework rather than against it, design tokens, minimizing custom CSS, production optimization.

#### Data Fetching (`standards/frontend/data-fetching.md`)

No hand-written `fetch`, query options living in `{feature}Queries`, components calling hooks while hooks call the API, mutations invalidating and reporting in Polish, errors arriving as a typed `ApiError`.

#### Language and Formatting (`standards/frontend/language.md`)

Every user-facing string in Polish, English staying under the surface in identifiers and logs, numbers and dates through `Intl` with locale `pl-PL`, Polish reaching the domain where it describes the product, category labels as per-feature maps.

#### Responsive Design (`standards/frontend/responsive.md`)

Generic baseline, kept as written: mobile-first, standard breakpoints, fluid layouts, relative units, cross-device testing, touch-friendly targets, mobile performance, readable typography, content priority.

---

### Backend Standards

Located in `docs/standards/backend/`

These standards apply to backend code (APIs, domain logic, auth, data layer).

#### API Design (`standards/backend/api.md`)

One controller file per endpoint exporting a handler or a factory for it, one feature factory assembling the offer handlers, routers that only wire, `app.ts` as the composition root, controllers calling the domain while repositories touch the database, resource paths, and why `bootstrap.ts` keeps its dynamic import.

#### Authentication and Route Protection (`standards/backend/auth.md`)

Stateless JWT in an httpOnly cookie bound through the `withAuth` router wrapper, with only the health check and login public, why the guard stays per route, the payload validated and not just the signature, three roles and what each may write with `DEMO` read-only on the catalogue, the demo session endpoint behind the login screen's button, registration as an admin action and where the first admin comes from, the three ADMIN-only `/api/users` routes for listing, deleting and resetting passwords, a per-IP budget of failed login attempts with the proxy trusted for one hop, security headers from helmet, offers scoped to their author with ADMIN exempt and a 404 for anybody else, CORS is not authorization, never log or return credentials.

#### Domain Layer (`standards/backend/domain.md`)

The domain package depending on nothing, four layers running in one direction (models, calculations, transformations, orchestrations), one folder per function, the `(context, inventory)` signature, pure functions with no I/O and no catching.

#### Models and Persistence (`standards/backend/models.md`)

Prisma confined to `src/db`, an offer storing its own output rather than being recomputed and belonging to the user who created it, clear names with real database constraints, validation belonging above the database.

#### Queries (`standards/backend/queries.md`)

Generic baseline, kept as written: parameterized queries, avoiding N+1, selecting only needed columns, strategic indexing, transactions, query timeouts, caching expensive queries.

#### Migrations (`standards/backend/migrations.md`)

Migrations committed and forward-only, running `prisma generate` after touching the schema, small and descriptively named changes with one concern each, minding the database machine that scales to zero.

---

### Testing Standards

Located in `docs/standards/testing/`

These standards apply to all testing code.

#### Test Writing (`standards/testing/test-writing.md`)

Nothing is mocked, a test sets the environment it needs instead of leaning on the maintainer's `.env`, tests sit beside their subject, explicit imports with a single `describe` and `it`, fixtures come from the domain package, assertions on the whole result and on the failure, two Vitest projects (`node` for domain and API, JSDOM `web` for the frontend) with coverage still measured on the domain only, a component earning a test on the same terms a domain function does rather than by category, one Playwright smoke test in `e2e/` outside the Vitest glob, the HTTP layer exercised through supertest, and no domain change finished without a test change.

---

### Workflow Standards

Located in `docs/standards/workflow/`

These standards govern how work moves through the repository: git usage and the working process.

#### Git Workflow (`standards/workflow/git.md`)

The agent never stages, commits or pushes, everything happens on `main` without task branches or pull requests except the release PR Release Please keeps open, Conventional Commit messages, and never reaching for a destructive shortcut.

#### Working Process (`standards/workflow/process.md`)

One concern per step, problems reported rather than quietly fixed, verification with `pnpm validate` and `pnpm vitest run`, what green actually means here, the five CI jobs with coverage thresholds enforced in the test job and a database only in the end-to-end one, why there is no typecheck job among them, the toolchain version pinned in three places, CI running without a database, and reading `docs/decisions.md` before touching wiring, auth or persistence.

---

### End Client and Prior Art

Two documents that are neither standards nor project overview, kept because their content cannot be
recovered from the code or from git history:

- `docs/client-requirements.md` — the end client's requirements list for the configurator, eight
  areas, gondolas first. Binding input, to be verified as work progresses rather than treated as
  background.
- `docs/gondola-prior-art.md` — how gondolas were modelled in the three earlier calculators, and
  what `gondolaUnits` actually means (sides, not segments along the run). Recovered from
  `projektownia-kalkulator`, `next-kalkulator` and `remix-kalkulator`.

---

## How to Use This Documentation

1. **Start Here**: Always read this INDEX.md first to understand what documentation exists
2. **Project Context**: Read `project/vision.md` and `project/tech-stack.md` for product direction and tooling. For architecture and the reasoning behind it, read `CLAUDE.md` and `docs/decisions.md`, which are the authoritative sources.
3. **Standards**: This index only points to the standards. Open and follow the specific standard files relevant to your task, don't rely on the index alone.
4. **Keep Updated**: Update documentation when making significant changes
5. **Customize**: Adapt all documentation to this project's specific needs

## Updating Documentation

- Project documentation should be updated when goals, tech stack, or architecture changes
- Technical standards should be updated when team conventions evolve
- Always update INDEX.md when adding, removing, or significantly changing documentation

---

**Maintained by hand.** These files were generated once by a packaged harness that has since
been dropped (decision 10 in `docs/decisions.md`). Nothing regenerates them, so a change that makes
one of them wrong is not finished until that file is corrected too.
