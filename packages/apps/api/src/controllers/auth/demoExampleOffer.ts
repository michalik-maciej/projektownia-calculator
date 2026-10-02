import { OfferInput } from "@/schemas/Offer.schema"

/**
 * Seeded into every fresh demo account so a first-time visitor sees a priced
 * configuration instead of an empty offer. Every width/depth/height
 * combination below is chosen to resolve against the catalogue the seed
 * always loads (`prisma/seed.ts`), not against any one visitor's inventory
 * edits, since `DEMO` cannot write to the catalogue anyway.
 */
export const demoExampleOffer: OfferInput = {
  title: "Przykładowa konfiguracja",
  discountPercentage: 10,
  layouts: [
    {
      depth: 47,
      height: 180,
      numberOfLayouts: 2,
      hasBaseCover: true,
      shelfUnits: [
        {
          width: 100,
          numberOfShelfUnits: 3,
          shelves: [{ depth: 47, numberOfShelves: 4 }],
        },
      ],
    },
    {
      height: 130,
      numberOfLayouts: 1,
      sides: [
        {
          depth: 47,
          shelfUnits: [
            {
              width: 80,
              numberOfShelfUnits: 2,
              shelves: [{ depth: 47, numberOfShelves: 4 }],
            },
            {
              width: 100,
              numberOfShelfUnits: 1,
              shelves: [{ depth: 47, numberOfShelves: 4 }],
            },
          ],
        },
        {
          depth: 47,
          shelfUnits: [
            {
              width: 80,
              numberOfShelfUnits: 2,
              shelves: [{ depth: 47, numberOfShelves: 4 }],
            },
            {
              width: 100,
              numberOfShelfUnits: 1,
              shelves: [{ depth: 47, numberOfShelves: 4 }],
            },
          ],
        },
      ],
      leftEndCap: {
        depth: 47,
        shelfUnits: [
          {
            width: 80,
            numberOfShelfUnits: 1,
            shelves: [{ depth: 47, numberOfShelves: 4 }],
          },
        ],
      },
      rightEndCap: {
        depth: 47,
        shelfUnits: [
          {
            width: 80,
            numberOfShelfUnits: 1,
            shelves: [{ depth: 47, numberOfShelves: 4 }],
          },
        ],
      },
    },
  ],
}
