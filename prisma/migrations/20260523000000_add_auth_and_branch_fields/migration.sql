CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN_PUSAT', 'ADMIN_CABANG', 'KARYAWAN_CABANG');

ALTER TABLE "Branch"
ADD COLUMN "regional" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "address" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX "Branch_code_key" ON "Branch"("code");

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "branchId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_role_idx" ON "User"("role");
CREATE INDEX "User_branchId_idx" ON "User"("branchId");
CREATE INDEX "User_isActive_idx" ON "User"("isActive");

ALTER TABLE "User"
ADD CONSTRAINT "User_branchId_fkey"
FOREIGN KEY ("branchId") REFERENCES "Branch"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
