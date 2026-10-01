## Authentication and Route Protection

### Stateless JWT in an httpOnly Cookie

Login signs a JWT with a 7 day expiry and sets it as an `httpOnly`, `secure`, `sameSite: "none"`
cookie. There is no session table and no server-side session state, which is what allows the Fly
machine to stop entirely when nobody is using the app. `sameSite: "none"` is required because the
front end (Vercel) and the API (Fly) are different sites.

The cost is accepted deliberately: a token cannot be revoked before it expires.

### Every Data Route Requires requireAuth

A route that reads or writes persisted data is bound through `withAuth`, which wraps a `Router()`
and injects `requireAuth` ahead of the handlers. Public by design are only the health check and
login.

```ts
const guarded = withAuth(router)

guarded.post("/items", createComponentController)
router.post("/login", loginController)
```

The guard is still per route, and that is deliberate: a router where some paths are public (`auth`)
would be wrong to protect wholesale. The wrapper only removes the repetition, so a route bound on
the bare `router` is the visible sign that it is public on purpose. The offers router went unguarded
for months, which is how a whole feature ends up public without anyone deciding it.

The protection is pinned by `packages/apps/api/src/tests/offerRoutesAuth.test.ts`, which walks every
offer route without a cookie and requires 401, and rejects a forged token as well. The inventory and
auth routers have no such test yet.

### requireAuth Validates the Payload, Not Just the Signature

A token that verifies against `JWT_SECRET` is still parsed with `JwtPayloadSchema` before it becomes
`req.user`, so a valid signature over the wrong shape answers 401 instead of putting a half-empty
payload in front of the controllers. Everything downstream can then rely on `sub`, `email` and
`role` being there.

### An Offer Belongs to Its Author

Offer endpoints turn `req.user` into an `OfferScope` (`{ isAdmin, userId }`) with `toOfferScope` and
pass it to the repository, which filters by owner. An offer belonging to somebody else answers 404,
the same as one that does not exist, so an id cannot be used to discover that an offer is there.
A user with the `ADMIN` role is exempt and reaches every offer. See decision 11 in
`docs/decisions.md`.

A missing `JWT_SECRET` is the server's fault, not the caller's, so `requireAuth` answers 500
`{ error: "Server misconfigured" }` instead of 401. In a correctly started process this cannot
happen, because `parseEnv` refuses to boot without it (see `../global/conventions.md`).

### Three Roles, and What Each May Touch

`Role` has three values and they differ only in what they may write:

| Role    | Offers                      | Component catalogue | Registration |
| ------- | --------------------------- | ------------------- | ------------ |
| `ADMIN` | every offer, read and write | read and write      | allowed      |
| `USER`  | its own                     | read and write      | refused, 403 |
| `DEMO`  | its own                     | read only           | refused, 403 |

`DEMO` exists so the login screen can offer a way in without an account. `POST /api/auth/demo`
creates a fresh account on every call, with a random password nobody holds, so the ordinary login is
not a way into it and two visitors never land on the same account. The new account is seeded with
one priced offer (`demoExampleOffer`) before the response goes out, so the visitor's first screen is
a filled-in configuration, not an empty one; seeding is best-effort and never fails the login, since
`priceOffer` already turns a missing component into data instead of an error. `requireInventoryWriter`
is what makes the catalogue read-only for that role: the catalogue is shared by everybody, so a
visitor editing it would be editing the real one. Offers are per author already, so a demo visitor
writing offers touches nothing but their own. `deleteExpiredDemoAccounts` deletes `DEMO` accounts
(and their offers) older than 24 hours as a side effect of the next `/demo` call, and `listUsers`
excludes the role so the admin's user list is not the place that count shows up (see decision 12).

### Registration Is an Admin Action

`POST /api/auth/register` sits behind `requireAuth` and `requireAdmin`, so a signed-in user without
the `ADMIN` role is answered 403 and an anonymous one 401. It was public for months, which on an
application where offers belong to their author meant anybody could give themselves a working
account.

Its only client is the user management dialog (`UserManagementButton` in the top bar, admin-only):
creating an account there calls this endpoint directly rather than going through a dedicated
`/api/users` route, since creation and registration are the same operation. Accounts are still made
deliberately, by an admin, not by anyone signing themselves up. That leaves the question of where the
first admin comes from, and the answer is the database, not the API. On a fresh deployment, promote
the account you created:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';
```

`prisma.user.create` in the repository sets no role, so every account starts as `USER`, including
the one the seed makes for the demo.

### User Management Is Three ADMIN-Only Routes

`createUsersRouter` (`routes/users.routes.ts`) mounts at `/api/users`, every path behind
`requireAuth` and `requireAdmin`:

- `GET /` lists accounts (id, email, role, no password hash), excluding role `DEMO` so an endless
  stream of ephemeral demo sessions never shows up next to the accounts an admin actually manages
  (decision 12).
- `DELETE /:id` refuses to delete the caller's own account (400, checked by `sub` against the
  param) and answers 409 when the account still owns offers, because the foreign key is
  `ON DELETE RESTRICT`: an offer is never silently orphaned or cascaded away.
- `PUT /:id/password` resets a password without the admin knowing the old one, the same bcrypt hash
  the registration path produces.

There is no `POST /api/users`: creating an account is `POST /api/auth/register` (above), reused
rather than duplicated because the two operations are identical. `/:id/password` is the one place
in this API where a path nests past the identifier; `api.md`'s "nesting is avoided" is a default,
not an absolute, and a sub-resource this small did not earn its own router.

### Login Has a Budget of Failed Attempts

`POST /api/auth/login` is wrapped in a per-IP rate limit (`createLoginRateLimit` in
`src/routes/loginRateLimit.ts`): ten failed attempts per fifteen minutes, successful ones not
counted, answered with 429 and `{ error: "Too many login attempts" }`. The limiter is built per app
instead of being imported as a module singleton, so one app's counter never leaks into another's,
which is also what makes it testable.

The store is in memory, which follows from the machine that stops when idle (decision 6): there is
nowhere to keep a shared counter and the budget resets on restart. This raises the cost of guessing
a password from free to inconvenient. It is not a defence against a distributed attempt.

For a per-IP budget to mean anything behind Fly's proxy, `createApp` sets `app.set("trust proxy", 1)`.
Without it every request arrives carrying the proxy's address and the whole world shares one budget.

### Security Headers Come From helmet

`createApp` mounts `helmet()` before anything else, so every response carries the usual defensive
headers (`nosniff`, `X-Frame-Options`, HSTS and the rest) and no longer advertises Express through
`X-Powered-By`. The defaults are taken as they come: this is a JSON API that serves no HTML, so the
parts of helmet that matter here are the small ones, and a hand-tuned policy would be a liability to
keep current for no gain.

### CORS Is Not Authorization

`cors({ credentials: true, origin: WEBAPP_DOMAIN })` constrains browsers, and only browsers. It stops
nothing that talks to the API directly, so it is never a reason to leave a route unguarded.

### Never Log or Return Credentials

Passwords are hashed with bcrypt and never logged. Authentication failures answer 401 with a generic
message: which half of the pair was wrong is not the client's business.
