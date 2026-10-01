## API Design

### One Controller File per Endpoint

Each endpoint lives in `src/controllers/{feature}/{verb}{Resource}.controller.ts` and exports one
function named `{verb}{Resource}Controller`, after its own file. Where the endpoint needs no
dependency that export is the handler itself, typed `(req: Request, res: Response)`, as every
inventory controller is. Where it does, the export takes the dependencies and returns the handler,
as `getOffers.controller.ts` exports `getOffersController({ getAllOffers })`. Every offer controller
is of the second kind, so within one feature folder the rule does not change from file to file.
Helpers living in the same folder drop the suffix: `requireAuth.ts`, `priceOffer.ts`,
`toOfferScope.ts`.

### One Feature Factory Assembles the Handlers

`controllers/offer/offerControllers.ts` builds every offer handler from a single dependency object
and returns them under the names the routes use (`list`, `details`, `create`, `update`, `remove`,
`preview`). The router asks for the set and binds it; it never assembles a controller itself. The
dependency type is exported next to that factory, as `OfferControllerDependencies`.

```ts
const offer = offerControllers(dependencies)
```

### Routers Only Wire

A route file creates a `Router()`, binds paths to imported controllers and exports it. No logic, no
validation, no database access. Middleware is applied per route rather than router-wide, through the
`withAuth` wrapper described in `auth.md`. A router that needs a dependency becomes a
`create{X}Router(dependencies)` factory instead of a module singleton.

```ts
const guarded = withAuth(router)

guarded.get("/items", getComponentsController)
```

### app.ts Is the Composition Root

`createApp` is the only place that picks real implementations, and it defaults them so tests can
substitute their own. Dependencies are threaded down explicitly, and the dependency's type is
exported next to the factory that consumes it.

```ts
export function createApp({
  getInventory = getAllComponents,
  offers = offerStore,
}: Partial<AppDependencies> = {}): Express
```

### Controllers Call Domain, Repositories Touch the Database

A controller validates, calls a domain orchestration, calls a repository, and answers. It never
reaches for the Prisma client itself. See `models.md`.

### Resource Paths

Everything is mounted under `/api/{resource}`, plural, with the identifier as the single path
segment (`/api/offers/:id`). Nesting is avoided; there is no versioning scheme and no need for one
while the API has a single known client. The one exception is `PUT /api/users/:id/password`
(`auth.md`): a sub-resource that small did not earn its own router, so the rule bends rather than
the file count growing for its own sake.

### bootstrap.ts Keeps Its Dynamic Import

`packages/apps/api/src/bootstrap.ts` is the production entry point. It registers the `@/domain` and
`@/schemas` aliases against the compiled `dist` folders with `module-alias` and only then
dynamically imports `./server`, because the aliases must exist before any module that uses them
loads. Turning that into a static import breaks the built API at runtime while `tsx` dev keeps
working, so it looks harmless in development.
