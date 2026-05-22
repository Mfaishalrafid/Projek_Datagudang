-- CreateEnum
CREATE TYPE "UsedGoodsCondition" AS ENUM ('LAYAK_JUAL', 'TIDAK_LAYAK');

-- CreateEnum
CREATE TYPE "UsedGoodsCategory" AS ENUM ('KARDUS_KARTON', 'PLASTIK', 'BESI_LOGAM', 'KERTAS_ARSIP', 'KAYU_PALET', 'ELEKTRONIK_BEKAS', 'TEKSTIL_KAIN', 'KACA', 'LAINNYA');

-- CreateEnum
CREATE TYPE "UsedGoodsUnit" AS ENUM ('PCS', 'KG', 'LEMBAR', 'IKAT', 'KARUNG', 'UNIT', 'SET', 'ROLL', 'DUS');

-- CreateTable
CREATE TABLE "UsedGoods" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "inputDate" DATE NOT NULL,
    "name" TEXT NOT NULL,
    "category" "UsedGoodsCategory" NOT NULL,
    "qty" DECIMAL(14,2) NOT NULL,
    "unit" "UsedGoodsUnit" NOT NULL,
    "estimatedWeightKg" DECIMAL(12,2),
    "estimatedPrice" DECIMAL(14,2),
    "condition" "UsedGoodsCondition" NOT NULL,
    "storageLocation" TEXT,
    "pic" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsedGoods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UsedGoods_code_key" ON "UsedGoods"("code");

-- CreateIndex
CREATE INDEX "UsedGoods_branchId_idx" ON "UsedGoods"("branchId");

-- CreateIndex
CREATE INDEX "UsedGoods_category_idx" ON "UsedGoods"("category");

-- CreateIndex
CREATE INDEX "UsedGoods_condition_idx" ON "UsedGoods"("condition");

-- CreateIndex
CREATE INDEX "UsedGoods_inputDate_idx" ON "UsedGoods"("inputDate");

-- AddForeignKey
ALTER TABLE "UsedGoods" ADD CONSTRAINT "UsedGoods_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
