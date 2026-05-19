-- CreateEnum
CREATE TYPE "Category" AS ENUM ('BAN', 'FILTER_OLI', 'REM_KAMPAS', 'TRANSMISI', 'MESIN', 'ELEKTRIKAL', 'OTHERS');

-- CreateEnum
CREATE TYPE "VehicleCode" AS ENUM ('CDE', 'CDD', 'BV', 'L300');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('ENGKEL', 'DOUBLE', 'BLIND_VAN', 'L300');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('LAYAK_JUAL', 'RUSAK');

-- CreateEnum
CREATE TYPE "BuyerType" AS ENUM ('PELANGGAN_UMUM', 'MITRA_BENGKEL', 'INTERNAL');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('APPROVAL', 'TERJUAL', 'BATAL');

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sparepart" (
    "id" TEXT NOT NULL,
    "pjpp" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "removedDate" DATE,
    "name" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "vehicleCode" "VehicleCode" NOT NULL,
    "vehicleType" "VehicleType" NOT NULL,
    "condition" "Condition" NOT NULL,
    "storageLocation" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sparepart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleOrder" (
    "id" TEXT NOT NULL,
    "sparepartId" TEXT NOT NULL,
    "buyerName" TEXT NOT NULL,
    "buyerType" "BuyerType" NOT NULL,
    "price" DECIMAL(14,2) NOT NULL,
    "saleDate" DATE NOT NULL,
    "status" "SaleStatus" NOT NULL DEFAULT 'APPROVAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SaleOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Branch_name_key" ON "Branch"("name");

-- CreateIndex
CREATE INDEX "Sparepart_branchId_idx" ON "Sparepart"("branchId");

-- CreateIndex
CREATE INDEX "Sparepart_category_idx" ON "Sparepart"("category");

-- CreateIndex
CREATE INDEX "Sparepart_condition_idx" ON "Sparepart"("condition");

-- CreateIndex
CREATE INDEX "Sparepart_vehicleType_idx" ON "Sparepart"("vehicleType");

-- CreateIndex
CREATE INDEX "Sparepart_removedDate_idx" ON "Sparepart"("removedDate");

-- CreateIndex
CREATE INDEX "SaleOrder_sparepartId_idx" ON "SaleOrder"("sparepartId");

-- CreateIndex
CREATE INDEX "SaleOrder_status_idx" ON "SaleOrder"("status");

-- CreateIndex
CREATE INDEX "SaleOrder_saleDate_idx" ON "SaleOrder"("saleDate");

-- AddForeignKey
ALTER TABLE "Sparepart" ADD CONSTRAINT "Sparepart_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleOrder" ADD CONSTRAINT "SaleOrder_sparepartId_fkey" FOREIGN KEY ("sparepartId") REFERENCES "Sparepart"("id") ON DELETE CASCADE ON UPDATE CASCADE;
