import { describe, expect, it } from "vitest"

import { mapLayoutsToOfferOutput } from "./mapLayoutsToOfferOutput"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("mapLayoutsToOfferOutput", () => {
  it("builds description of wall layout", () => {
    const output = mapLayoutsToOfferOutput(
      [
        {
          depth: 47,
          height: 130,
          numberOfLayouts: 3,
          shelfUnits: [
            {
              width: 80,
              numberOfShelfUnits: 4,
              shelves: [{ depth: 37, numberOfShelves: 5 }],
            },
            {
              width: 100,
              numberOfShelfUnits: 1,
              shelves: [
                { depth: 37, numberOfShelves: 1 },
                { depth: 47, numberOfShelves: 1 },
              ],
            },
          ],
        },
      ],
      componentCatalogMock,
    )

    expect(output).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          description: expect.any(String),
          basePrice: expect.any(Number),
        }),
      ]),
    )
  })

  it("prices an item set by its items alone", () => {
    const output = mapLayoutsToOfferOutput(
      [
        {
          items: [
            { id: "foot-37", quantity: 2 },
            { id: "misc-inne-3-240-3", quantity: 1 },
          ],
        },
      ],
      componentCatalogMock,
    )

    expect(output).toEqual([
      {
        basePrice: 388.78,
        breakdown: {
          foot: [{ id: "foot-37", label: "Stopa 37", quantity: 2 }],
          misc: [
            { id: "misc-inne-3-240-3", label: "Inne 3/240/3", quantity: 1 },
          ],
        },
        description: "zestaw elementów / stopa 37 x2, inne 3/240/3 x1",
        lines: [
          { basePrice: 88.78, description: "stopa 37 x2" },
          { basePrice: 300, description: "inne 3/240/3 x1" },
        ],
      },
    ])
  })
})
