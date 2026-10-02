import { find, lowerFirst } from "lodash/fp"

import { Component } from "../../models/component"

export function describeComponent(id: string, inventory: Component[]) {
  return lowerFirst(find({ id }, inventory)?.label ?? id)
}
