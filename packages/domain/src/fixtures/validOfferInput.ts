import { OfferInput } from "@/schemas/Offer.schema"

export const validOfferInput: OfferInput = {
  title: "Offer test",
  discountPercentage: 10,
  hasPriceStrips: true,
  shelfStopPercentage: 0,
  layouts: [
    {
      depth: 47,
      height: 180,
      numberOfLayouts: 1,
      shelfUnits: [
        {
          width: 100,
          numberOfShelfUnits: 1,
          shelves: [{ depth: 47, numberOfShelves: 4 }],
        },
      ],
    },
  ],
}
