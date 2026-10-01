## Migrations

### Migrations Are Committed and Forward-Only

Every schema change ships as a Prisma migration checked into the repository. Deployment applies them
through the Fly.io release command (`prisma migrate deploy`), before the new machine serves traffic,
so a migration that fails stops the release rather than corrupting a running app.

### Run prisma generate After Touching the Schema

The generated client is an input to type checking, and both the API's `typecheck` and `build`
scripts run `prisma generate` first. After editing `schema.prisma` by hand, run
`pnpm --filter @projektownia-calculator/api run prisma generate` before trusting a local type check.

### Small, Descriptive, One Concern

A migration does one thing and says what it does in its name. Schema changes and data backfills are
separate migrations.

### Mind the Machine That Scales to Zero

The API runs at 256 MB and stops when idle. A migration that needs a long table rewrite will run
inside the release step on that same small machine, so prefer changes that are cheap to apply, and
add indexes deliberately rather than by reflex.
