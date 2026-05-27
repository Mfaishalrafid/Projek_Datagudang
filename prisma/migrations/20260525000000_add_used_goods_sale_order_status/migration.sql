ALTER TABLE "UsedGoodsSaleOrder" ADD COLUMN "status" "SaleStatus" NOT NULL DEFAULT 'APPROVAL';

CREATE INDEX "UsedGoodsSaleOrder_status_idx" ON "UsedGoodsSaleOrder"("status");
