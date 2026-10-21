import { ComponentQuantityFields } from "./ComponentQuantityFields"
import { RunOptionsFields } from "./RunOptionsFields"
import { SectionLabel } from "./SectionLabel"
import { RunOptionsPath } from "../../offer.types"

export function OptionsFields({
  areGondolaSidesUnlinked,
  layoutIndex,
  optionsPath,
}: {
  areGondolaSidesUnlinked?: boolean
  layoutIndex: number
  optionsPath: RunOptionsPath
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-background p-4">
      <SectionLabel>Opcje</SectionLabel>

      <RunOptionsFields
        areGondolaSidesUnlinked={areGondolaSidesUnlinked}
        optionsPath={optionsPath}
      />

      <ComponentQuantityFields
        label="Inne elementy"
        name={`layouts.${layoutIndex}.extras`}
      />
    </div>
  )
}
