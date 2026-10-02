import { GondolaSide, LayoutGondola } from "@/schemas/LayoutGondola.schema"

const listUnitWidths = ({ shelfUnits }: GondolaSide) =>
  shelfUnits.flatMap(({ numberOfShelfUnits, width }) =>
    Array.from({ length: numberOfShelfUnits }, () => width),
  )

export const haveDifferentUnitLayouts = ([
  firstSide,
  secondSide,
]: LayoutGondola["sides"]) =>
  listUnitWidths(firstSide).join() !== listUnitWidths(secondSide).join()
