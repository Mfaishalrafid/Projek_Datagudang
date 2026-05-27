CREATE TABLE "UsedGoodsSaleOrder" (
    "id" TEXT NOT NULL,
    "usedGoodsId" TEXT NOT NULL,
    "qty" DECIMAL(14,2) NOT NULL,
    "buyerName" TEXT NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "saleDate" DATE NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsedGoodsSaleOrder_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UsedGoodsSaleOrder_usedGoodsId_idx" ON "UsedGoodsSaleOrder"("usedGoodsId");
CREATE INDEX "UsedGoodsSaleOrder_saleDate_idx" ON "UsedGoodsSaleOrder"("saleDate");

ALTER TABLE "UsedGoodsSaleOrder" ADD CONSTRAINT "UsedGoodsSaleOrder_usedGoodsId_fkey" FOREIGN KEY ("usedGoodsId") REFERENCES "UsedGoods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
