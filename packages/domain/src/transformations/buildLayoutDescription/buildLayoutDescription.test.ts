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

    expect(description).toEqual(
      "3 x ciąg regałów przyściennych / 4x80 / 1x100 / baza 47 / h-130 / półki 5x37",
    )
  })

  it("builds description of gondola layout", () => {
    const description = buildLayoutDescription(
      {
        height: 130,
        numberOfLayouts: 1,
        gondolaUnits: [
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
            depth: 37,
            shelfUnits: [
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

    expect(description).toEqual(
      "1 x ciąg regałów dwustronnych / 2x80 / 1x100 / baza 47 / h-130",
    )
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

    expect(description).toEqual(
      "zestaw elementów: plecy 10/100 x3, noga 210/8/3 x1",
    )
  })

  it("describes an empty item set by its kind alone", () => {
    expect(buildLayoutDescription({ items: [] }, componentCatalogMock)).toEqual(
      "zestaw elementów",
    )
  })

  it("returns default description", () => {
    expect(buildLayoutDescription(null, componentCatalogMock)).toEqual(
      "opis niedostępny",
    )
  })
  it("names the end caps of a gondola layout", () => {
    const description = buildLayoutDescription(
      {
        height: 130,
        numberOfLayouts: 1,
        gondolaUnits: [
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
      "1 x ciąg regałów dwustronnych / 2x80 / baza 47 / h-130 / szczyt lewy 100/37 / szczyt prawy 66/30",
    )
  })
})
