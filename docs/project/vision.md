# Project Vision

## Overview

Projektownia Calculator is an internal web application that turns a shelf configuration (wall runs and
gondola displays) into a bill of materials and a priced offer.

## Current State

- **Age**: ~9 months (first commit 2025-12-16, actively developed as of 2026-09)
- **Status**: Active development, single-maintainer repository
- **Users**: One commercial user, plus the maintainer
- **Tech Stack**: TypeScript monorepo on pnpm and Turborepo: React 19 + Vite front end, Express 5 +
  Prisma API, a dependency-free domain package, and Valibot schemas shared by both sides. Details in
  `tech-stack.md`.

## Purpose

Quoting a shelf system means counting components across several layouts (shelves, back panels, feet,
legs, base shelves) and then pricing them. Done by hand this is slow and quietly error-prone: a wrong
upright count or a mispriced back panel produces a plausible-looking offer that is simply wrong.

The application makes that calculation repeatable, and stores each offer together with the output it
was quoted at, rather than recomputing it against today's prices. That is a deliberate choice, so
that reopening an old offer shows what was actually promised (decision 7 in `docs/decisions.md`).

The component inventory is shared by everybody, an offer is not: it belongs to the account that
created it, and nobody else reaches it (decision 11 in `docs/decisions.md`).

## Goals (Next 6-12 Months)

1. **Rebuild the configuration UI around a scale-drawing metaphor.** The configuration should read as
   a drawing of the shelving being specified, not as a form of loose numeric fields.
2. **Build the run configuration form.** The domain calculations exist and are tested; the interface
   for configuring runs is the missing half of the product.
3. **Work through the end client's backlog**, with gondola configurations first, as that is the part
   the client depends on most.

## Evolution

The same problem has been solved four times (`projektownia-kalkulator`, `next-calculator`,
`remix-calculator`, and this repository). Every rewrite replaced the framework while the calculation
rules survived, which is why those rules live in a package that depends on nothing (decision 2 in
`docs/decisions.md`).

Alongside the product work, this repository is where an agent-driven development workflow is being
learned and put in place. The standards under `docs/standards/` and the guard hook in
`.claude/hooks/` are what survives of that so far; a packaged harness was tried and dropped
(decision 10 in `docs/decisions.md`).

---

_Last Updated_: 2026-09-11
_Auto-detected_: age, status, tech stack, architecture (from codebase analysis)
_User-provided_: purpose, goals, product direction
