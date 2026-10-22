-- CreateTable
CREATE TABLE "OfferShare" (
    "offerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "OfferShare_pkey" PRIMARY KEY ("offerId","userId")
);

-- CreateIndex
CREATE INDEX "OfferShare_userId_idx" ON "OfferShare"("userId");

-- AddForeignKey
ALTER TABLE "OfferShare" ADD CONSTRAINT "OfferShare_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferShare" ADD CONSTRAINT "OfferShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
