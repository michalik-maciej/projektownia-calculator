#!/usr/bin/env node

import { readFileSync } from "node:fs"
import { join } from "node:path"

const AUDIT_INTERVAL_DAYS = 7
const DAY_MS = 24 * 60 * 60 * 1000

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
const processDoc = readFileSync(
  join(projectDir, "docs/standards/workflow/process.md"),
  "utf8",
)

const areas = processDoc
  .split("\n")
  .map((line) => line.split("|").map((cell) => cell.trim()))
  .filter(
    (cells) =>
      cells.length === 5 && cells[1] !== "Area" && !cells[1].startsWith("-"),
  )
  .map(([, area, scope, lastAudit]) => ({ area, scope, lastAudit }))

const auditDates = areas
  .map(({ lastAudit }) => lastAudit)
  .filter((date) => date !== "never")
const latestAudit = auditDates.sort().at(-1)
const daysSinceLatest =
  latestAudit === undefined
    ? Infinity
    : (Date.now() - Date.parse(latestAudit)) / DAY_MS

if (areas.length === 0 || daysSinceLatest <= AUDIT_INTERVAL_DAYS)
  process.exit(0)

const next =
  areas.find(({ lastAudit }) => lastAudit === "never") ??
  [...areas].sort((a, b) => a.lastAudit.localeCompare(b.lastAudit))[0]
const due =
  latestAudit === undefined
    ? "no area audited yet"
    : `last audit ${Math.floor(daysSinceLatest)} days ago`
const message = `Weekly audit due: ${next.area} (${next.scope}), ${due}. See "Review Runs on Two Rhythms" in docs/standards/workflow/process.md.`

console.log(
  JSON.stringify({
    systemMessage: message,
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: message,
    },
  }),
)
