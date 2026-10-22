import { ComponentQuantityFields } from "./ComponentQuantityFields"
import { RunOptionsFields } from "./RunOptionsFields"
import { SectionLabel } from "./SectionLabel"
import { RunOptionsPath } from "../../offer.types"

export function OptionsFields({
  areGondolaSidesUnlinked,
  layoutIndex,
  optionsPath,
  topCoverPath,
}: {
  areGondolaSidesUnlinked?: boolean
  layoutIndex: number
  optionsPath: RunOptionsPath
  topCoverPath?: RunOptionsPath
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border bg-background p-4">
      <SectionLabel>Opcje</SectionLabel>

      <RunOptionsFields
        areGondolaSidesUnlinked={areGondolaSidesUnlinked}
        optionsPath={optionsPath}
        topCoverPath={topCoverPath}
      />

      <ComponentQuantityFields
        label="Inne elementy"
        name={`layouts.${layoutIndex}.extras`}
      />
    </div>
  )
}
