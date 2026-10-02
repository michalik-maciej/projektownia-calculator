import { describe, expect, it } from "vitest"

import { createOfferPreview } from "./createOfferPreview"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("createOfferPreview", () => {
  it("returns offer preview", () => {
    const response = createOfferPreview(
      {
        discountPercentage: 10,
        layouts: [
          {
            height: 180,
            depth: 47,
            numberOfLayouts: 1,
            shelfUnits: [
              {
                width: 100,
                numberOfShelfUnits: 1,
                shelves: [],
              },
            ],
          },
        ],
        title: "Test Offer",
      },
      componentCatalogMock,
    )

    const expectedResult = {
      breakdown: {
        back: [
          { id: "back-40-100", quantity: 4, label: "Plecy 40/100" },
          { id: "back-10-100", quantity: 1, label: "Plecy 10/100" },
        ],
        shelf: [{ id: "shelf-100-47", quantity: 1, label: "Półka 100/47" }],
        leg: [{ id: "leg-180-8-3", quantity: 2, label: "Noga 180/8/3" }],
        foot: [{ id: "foot-47", quantity: 2, label: "Stopa 47" }],
      },
      layouts: [
        {
          basePrice: 553.85,
          description: "ciąg regałów przyściennych / 1x100 / baza 47 / h-180",
          breakdown: {
            back: [
              { id: "back-40-100", quantity: 4, label: "Plecy 40/100" },
              { id: "back-10-100", quantity: 1, label: "Plecy 10/100" },
            ],
            shelf: [{ id: "shelf-100-47", quantity: 1, label: "Półka 100/47" }],
            leg: [{ id: "leg-180-8-3", quantity: 2, label: "Noga 180/8/3" }],
            foot: [{ id: "foot-47", quantity: 2, label: "Stopa 47" }],
          },
        },
      ],
      pricing: {
        basePrice: 553.85,
        discountPrice: 498.47,
        discountPercentage: 10,
      },
      title: "Test Offer",
    }

    expect(response).toEqual(expectedResult)
  })
})
