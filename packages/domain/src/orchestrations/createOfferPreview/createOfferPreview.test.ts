import { describe, expect, it } from "vitest"

import { createOfferPreview } from "./createOfferPreview"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("createOfferPreview", () => {
  it("returns offer preview", () => {
    const response = createOfferPreview(
      {
        discountPercentage: 10,
        hasPriceStrips: true,
        shelfStopPercentage: 0,
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
          {
            basePrice: 16,
            id: "back-10-100",
            quantity: 1,
            label: "Plecy 10/100",
          },
          {
            basePrice: 136.28,
            id: "back-40-100",
            quantity: 4,
            label: "Plecy 40/100",
          },
        ],
        shelf: [
          {
            basePrice: 66.07,
            id: "shelf-100-47",
            quantity: 1,
            label: "Półka 100/47",
          },
        ],
        leg: [
          {
            basePrice: 231.24,
            id: "leg-180-8-3",
            quantity: 2,
            label: "Noga 180/8/3",
          },
        ],
        foot: [
          {
            basePrice: 104.26,
            id: "foot-47",
            quantity: 2,
            label: "Stopa 47",
          },
        ],
        priceStrip: [
          {
            basePrice: 2.2,
            id: "price-strip-100",
            quantity: 1,
            label: "Listwa cenowa 100",
          },
        ],
      },
      layouts: [
        {
          basePrice: 553.85,
          description: "H180 · B47 · 1×100",
          breakdown: {
            back: [
              {
                basePrice: 16,
                id: "back-10-100",
                quantity: 1,
                label: "Plecy 10/100",
              },
              {
                basePrice: 136.28,
                id: "back-40-100",
                quantity: 4,
                label: "Plecy 40/100",
              },
            ],
            shelf: [
              {
                basePrice: 66.07,
                id: "shelf-100-47",
                quantity: 1,
                label: "Półka 100/47",
              },
            ],
            leg: [
              {
                basePrice: 231.24,
                id: "leg-180-8-3",
                quantity: 2,
                label: "Noga 180/8/3",
              },
            ],
            foot: [
              {
                basePrice: 104.26,
                id: "foot-47",
                quantity: 2,
                label: "Stopa 47",
              },
            ],
          },
        },
      ],
      priceStrips: { basePrice: 2.2, quantity: 1 },
      shelfStops: null,
      pricing: {
        basePrice: 556.05,
        discountPrice: 500.45,
        discountPercentage: 10,
      },
      title: "Test Offer",
    }

    expect(response).toEqual(expectedResult)
  })

  it("leaves runs excluded from the offer out of the price, keeping their place in the list", () => {
    const wall = {
      height: 180,
      depth: 47,
      numberOfLayouts: 1,
      shelfUnits: [{ width: 100, numberOfShelfUnits: 1, shelves: [] }],
    }
    const offer = {
      discountPercentage: 10,
      hasPriceStrips: true,
      shelfStopPercentage: 0,
      title: "Test Offer",
    }
    const offeredOnly = createOfferPreview(
      { ...offer, layouts: [wall] },
      componentCatalogMock,
    )

    const response = createOfferPreview(
      {
        ...offer,
        layouts: [{ ...wall, isExcludedFromOffer: true }, wall],
      },
      componentCatalogMock,
    )

    expect(response).toEqual({
      ...offeredOnly,
      layouts: [
        { basePrice: 0, breakdown: {}, description: "H180 · B47 · 1×100" },
        ...offeredOnly.layouts,
      ],
    })
  })
})
