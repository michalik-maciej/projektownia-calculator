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

| ID  | Date | Source | File | Issue | Status |
| --- | ---- | ------ | ---- | ----- | ------ |
