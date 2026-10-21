-- Offers are priced against the current catalogue whenever they are read, so
-- the stored pricing is never read back.
ALTER TABLE "Offer" DROP COLUMN "output";
