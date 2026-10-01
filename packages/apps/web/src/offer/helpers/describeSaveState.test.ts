import { describe, expect, it } from "vitest"

import { describeSaveState } from "./describeSaveState"

describe("describeSaveState", () => {
  it("reports a failed save even if there are no pending changes", () => {
    expect(
      describeSaveState({ hasFailed: true, isDirty: false, isSaving: false }),
    ).toBe("Nie zapisano")
  })

  it("reports saving in progress", () => {
    expect(
      describeSaveState({ hasFailed: false, isDirty: true, isSaving: true }),
    ).toBe("Zapisywanie…")
  })

  it("reports unsaved changes once saving finishes", () => {
    expect(
      describeSaveState({ hasFailed: false, isDirty: true, isSaving: false }),
    ).toBe("Niezapisane zmiany")
  })

  it("reports a clean state when there is nothing to save", () => {
    expect(
      describeSaveState({ hasFailed: false, isDirty: false, isSaving: false }),
    ).toBe("Zapisano")
  })
})
