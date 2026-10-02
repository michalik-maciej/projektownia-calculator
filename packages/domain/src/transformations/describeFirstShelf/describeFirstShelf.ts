import { ShelfUnit } from "../../models/shelfUnit"

export function describeFirstShelf(shelfUnits: ShelfUnit[]) {
  const firstShelf = shelfUnits.find(({ shelves = [] }) => shelves.length > 0)
    ?.shelves?.[0]

  return firstShelf && `${firstShelf.numberOfShelves}x${firstShelf.depth}`
}
