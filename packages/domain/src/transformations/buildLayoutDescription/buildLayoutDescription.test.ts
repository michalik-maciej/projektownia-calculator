import { describe, expect, it } from "vitest"

import { buildLayoutDescription } from "./buildLayoutDescription"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("buildLayoutDescription", () => {
  it("builds description of wall layout", () => {
    const description = buildLayoutDescription(
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
      componentCatalogMock,
    )

    expect(description).toEqual("H130 · B47 · 4×80 + 1×100 · półki 5×37")
  })

  it("builds description of gondola layout", () => {
    const description = buildLayoutDescription(
      {
        height: 130,
        numberOfLayouts: 1,
        sides: [
          {
            depth: 47,
            shelfUnits: [
              {
                numberOfShelfUnits: 2,
                shelves: [],
                width: 80,
              },
              {
                numberOfShelfUnits: 1,
                shelves: [],
                width: 100,
              },
            ],
          },
          {
            depth: 47,
            shelfUnits: [
              {
                numberOfShelfUnits: 2,
                shelves: [],
                width: 80,
              },
              {
                numberOfShelfUnits: 1,
                shelves: [],
                width: 100,
              },
            ],
          },
        ],
        extras: [{ id: "extra-37", quantity: 2 }],
      },
      componentCatalogMock,
    )

    expect(description).toEqual("H130 · B47 · 4×80 + 2×100")
  })

  it("sums the units of both sides and lists the bases and shelves that differ", () => {
    const description = buildLayoutDescription(
      {
        height: 130,
        numberOfLayouts: 1,
        sides: [
          {
            depth: 47,
            shelfUnits: [
              {
                numberOfShelfUnits: 2,
                shelves: [{ depth: 47, numberOfShelves: 4 }],
                width: 125,
              },
            ],
          },
          {
            depth: 37,
            shelfUnits: [
              {
                numberOfShelfUnits: 1,
                shelves: [{ depth: 37, numberOfShelves: 3 }],
                width: 125,
              },
              {
                numberOfShelfUnits: 1,
                shelves: [],
                width: 80,
              },
            ],
          },
        ],
      },
      componentCatalogMock,
    )

    expect(description).toEqual(
      "H130 · B47/37 · 3×125 + 1×80 · półki 4×47/3×37",
    )
  })

  it("names a base shared by both sides once", () => {
    const side = {
      depth: 47,
      shelfUnits: [
        {
          numberOfShelfUnits: 2,
          shelves: [],
          width: 80,
        },
      ],
    }

    const description = buildLayoutDescription(
      {
        height: 130,
        numberOfLayouts: 1,
        sides: [
          { ...side, backVariant: 2, hasBaseCover: true },
          { ...side, backVariant: 0 },
        ],
      },
      componentCatalogMock,
    )

    expect(description).toEqual("H130 · B47 · 4×80")
  })

  it("builds description of item set", () => {
    const description = buildLayoutDescription(
      {
        items: [
          { id: "back-10-100", quantity: 3 },
          { id: "leg-210-8-3", quantity: 1 },
        ],
      },
      componentCatalogMock,
    )

    expect(description).toEqual("plecy 10/100, noga 210/8/3")
  })

  it("describes an empty item set as empty", () => {
    expect(buildLayoutDescription({ items: [] }, componentCatalogMock)).toEqual(
      "pusty",
    )
  })

  it("returns default description", () => {
    expect(buildLayoutDescription(null, componentCatalogMock)).toEqual(
      "opis niedostępny",
    )
  })
  it("lists the end caps of a gondola by their dimensions", () => {
    const description = buildLayoutDescription(
      {
        height: 130,
        numberOfLayouts: 1,
        sides: [
          {
            depth: 47,
            shelfUnits: [
              {
                numberOfShelfUnits: 2,
                shelves: [],
                width: 80,
              },
            ],
          },
          {
            depth: 47,
            shelfUnits: [
              {
                numberOfShelfUnits: 2,
                shelves: [],
                width: 80,
              },
            ],
          },
        ],
        leftEndCap: {
          depth: 37,
          shelfUnits: [
            {
              numberOfShelfUnits: 1,
              shelves: [],
              width: 100,
            },
          ],
        },
        rightEndCap: {
          depth: 30,
          shelfUnits: [
            {
              numberOfShelfUnits: 1,
              shelves: [],
              width: 66,
            },
          ],
        },
      },
      componentCatalogMock,
    )

    expect(description).toEqual(
      "H130 · B47 · 4×80 · szczyt 100/37 · szczyt 66/30",
    )
  })

  it("counts two identical end caps together", () => {
    const side = {
      depth: 47,
      shelfUnits: [{ numberOfShelfUnits: 2, shelves: [], width: 80 }],
    }
    const endCap = {
      depth: 37,
      shelfUnits: [{ numberOfShelfUnits: 1, shelves: [], width: 100 }],
    }

    const description = buildLayoutDescription(
      {
        height: 130,
        numberOfLayouts: 1,
        sides: [side, side],
        leftEndCap: endCap,
        rightEndCap: endCap,
      },
      componentCatalogMock,
    )

    expect(description).toEqual("H130 · B47 · 4×80 · 2× szczyt 100/37")
  })
})
