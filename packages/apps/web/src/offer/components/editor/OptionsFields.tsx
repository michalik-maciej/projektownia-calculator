import { ComponentQuantityFields } from "./ComponentQuantityFields"
import { RunOptionsFields } from "./RunOptionsFields"
import { SectionLabel } from "./SectionLabel"
import { RunOptionsPath } from "../../offer.types"

export function OptionsFields({
  layoutIndex,
  optionsPath,
}: {
  layoutIndex: number
  optionsPath: RunOptionsPath
}) {
  return (
    <div className="flex flex-col gap-2 bg-neutral-200/50 dark:bg-neutral-800/50 p-4 rounded-lg">
      <SectionLabel>Opcje</SectionLabel>

      <RunOptionsFields optionsPath={optionsPath} />

      <ComponentQuantityFields
        label="Inne elementy"
        name={`layouts.${layoutIndex}.extras`}
      />
    </div>
  )
}
