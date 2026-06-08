-- CreateEnum
CREATE TYPE "SgaEligibilityStatus" AS ENUM ('LAYAK_JUAL', 'TIDAK_LAYAK');

-- CreateEnum
CREATE TYPE "SgaTransactionStatus" AS ENUM ('TERSEDIA', 'DALAM_ORDER', 'TERJUAL');

-- CreateTable
CREATE TABLE "SgaItem" (
    "id" TEXT NOT NULL,
    "tlsNumber" TEXT NOT NULL,
    "inputDate" DATE NOT NULL,
    "branchId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "picName" TEXT NOT NULL,
    "eligibilityStatus" "SgaEligibilityStatus" NOT NULL,
    "transactionStatus" "SgaTransactionStatus" NOT NULL DEFAULT 'TERSEDIA',
    "note" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SgaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SgaSaleOrder" (
    "id" TEXT NOT NULL,
    "sgaItemId" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerType" TEXT,
    "salePrice" DECIMAL(14,2) NOT NULL,
    "saleDate" DATE NOT NULL,
    "status" "SaleStatus" NOT NULL DEFAULT 'APPROVAL',
    "note" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SgaSaleOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SgaItem_tlsNumber_key" ON "SgaItem"("tlsNumber");

-- CreateIndex
CREATE INDEX "SgaItem_branchId_idx" ON "SgaItem"("branchId");

-- CreateIndex
CREATE INDEX "SgaItem_inputDate_idx" ON "SgaItem"("inputDate");

-- CreateIndex
CREATE INDEX "SgaItem_eligibilityStatus_idx" ON "SgaItem"("eligibilityStatus");

-- CreateIndex
CREATE INDEX "SgaItem_transactionStatus_idx" ON "SgaItem"("transactionStatus");

-- CreateIndex
CREATE INDEX "SgaItem_picName_idx" ON "SgaItem"("picName");

-- CreateIndex
CREATE INDEX "SgaSaleOrder_sgaItemId_idx" ON "SgaSaleOrder"("sgaItemId");

-- CreateIndex
CREATE INDEX "SgaSaleOrder_status_idx" ON "SgaSaleOrder"("status");

-- CreateIndex
CREATE INDEX "SgaSaleOrder_saleDate_idx" ON "SgaSaleOrder"("saleDate");

-- AddForeignKey
ALTER TABLE "SgaItem" ADD CONSTRAINT "SgaItem_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SgaItem" ADD CONSTRAINT "SgaItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SgaSaleOrder" ADD CONSTRAINT "SgaSaleOrder_sgaItemId_fkey" FOREIGN KEY ("sgaItemId") REFERENCES "SgaItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SgaSaleOrder" ADD CONSTRAINT "SgaSaleOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
