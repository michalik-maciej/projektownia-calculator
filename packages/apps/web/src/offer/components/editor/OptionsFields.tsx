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
    <div className="flex flex-col gap-2 border bg-muted p-4 rounded-lg">
      <SectionLabel>Opcje</SectionLabel>

      <RunOptionsFields optionsPath={optionsPath} />

      <ComponentQuantityFields
        label="Inne elementy"
        name={`layouts.${layoutIndex}.extras`}
      />
    </div>
  )
}
