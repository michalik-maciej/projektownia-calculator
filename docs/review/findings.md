# Review Findings

Findings from the review before each release and from the weekly area audit, kept until they are
resolved. Rejected findings stay listed with their reason, so a later review does not raise them
again.

Each finding is one step and one commit. The commit that resolves a finding also updates its status
here.

## Entry Format

| Field  | Content                                                             |
| ------ | ------------------------------------------------------------------- |
| ID     | `R-001`, numbered in order, never reused                            |
| Date   | When the finding was raised (`YYYY-MM-DD`)                          |
| Source | `release vX.Y.Z` (range from the previous tag) or `audit <area>`    |
| File   | Repo-relative path, with a line when it helps                       |
| Issue  | One sentence: what is wrong and what it breaks                      |
| Status | `open`, `fixed <sha>`, `deferred: <reason>` or `rejected: <reason>` |

## Findings

| ID    | Date       | Source       | File                                                                                                 | Issue                                                                                                                                                                                                                                                                                    | Status |
| ----- | ---------- | ------------ | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| R-001 | 2026-10-26 | audit domain | `packages/domain/src/transformations/mapLayoutsToOfferOutput/mapLayoutsToOfferOutput.ts:9`           | A transformation imports three orchestrations and repeats the layout-type switch from `calculateOfferDemand`, so calls go upwards, a new layout type must be added in two places and `createOfferPreview` computes every layout's demand twice                                           | fixed  |
| R-002 | 2026-10-26 | audit domain | `packages/domain/src/calculations/calculateBaseShelfDemand/calculateBaseShelfDemand.ts:3`            | Imports `ShelfUnit` through the `@/domain` alias from inside the domain package, where `coding-style.md` requires a relative path; ESLint does not catch it                                                                                                                              | fixed  |
| R-003 | 2026-10-26 | audit domain | `packages/domain/src/calculations/calculateBomPrice/calculateBomPrice.ts:11`                         | `calculateBomPrice`, `calculateOfferDemand` and `mapLayoutsToOfferOutput` are exported arrow consts, against the function declaration rule in `coding-style.md`                                                                                                                          | fixed  |
| R-004 | 2026-10-26 | audit domain | `packages/domain/src/transformations/countShelvesByWidth/`                                           | `countShelvesByWidth`, `listImpulseSideShelfUnits` and `matchComponentsByWidth` have no `{name}.test.ts`, which `domain.md` requires; they are exercised only through the orchestrations that call them                                                                                  | fixed  |
| R-005 | 2026-10-26 | audit domain | `packages/domain/src/calculations/calculateBackPanelDemand/calculateBackPanelDemand.ts:48`           | `countPerShelfUnit === 0` can never hold, because the line above already skips any panel taller than the remainder; dead branch                                                                                                                                                          | fixed  |
| R-006 | 2026-10-26 | audit domain | `packages/domain/src/orchestrations/createOfferPreview/createOfferPreview.ts:47`                     | `calculateBomPrice` already returns `discountPercentage`, and `createOfferPreview` sets it again with the same value                                                                                                                                                                     | fixed  |
| R-007 | 2026-10-26 | audit domain | `packages/domain/src/orchestrations/calculateGondolaLayoutDemand/calculateGondolaLayoutDemand.ts:51` | End caps are counted once whatever the gondola's `numberOfLayouts` (also in `countShelvesByWidth.ts:35`), while its sides and legs scale with it; the test pins this, but no decision records whether two gondolas share one pair of end caps, so it needs the end client's confirmation | fixed  |
| R-008 | 2026-10-26 | audit domain | `CLAUDE.md`, `docs/standards/backend/domain.md`                                                      | Both say orchestrations return an `OfferOutput`; only `createOfferPreview` does, the rest return `ComponentDemand`, and `calculateOfferDemand`, `calculatePriceStripDemand` and `calculateShelfStopDemand` take positional arguments instead of the `(context, inventory)` signature     | fixed  |
| R-009 | 2026-10-26 | audit domain | `packages/domain/src/calculations/calculateBaseShelfDemand/calculateBaseShelfDemand.ts:22`           | The error message names only the depth while the lookup also matches width, so a missing width reads as a missing depth                                                                                                                                                                  | fixed  |
