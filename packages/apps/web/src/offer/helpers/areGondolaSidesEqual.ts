import { LayoutGondola } from "@/schemas/LayoutGondola.schema"

export const areGondolaSidesEqual = ([
  firstSide,
  secondSide,
]: LayoutGondola["sides"]) =>
  JSON.stringify(firstSide) === JSON.stringify(secondSide)
