import { textSection } from "../../../core/ui/typography"

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className={textSection}>{children}</p>
}
