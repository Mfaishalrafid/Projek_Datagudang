import { PrismaClient } from "@prisma/client";
import { branchSeeds } from "../src/data/options";
import {
  normalizeSeedRecord,
  normalizeUsedGoodsSeedRecord,
  sparepartSeeds,
  usedGoodsSeeds
} from "../src/data/seed-data";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  const branches = new Map<string, string>();

  for (const branch of branchSeeds) {
    const created = await prisma.branch.upsert({
      where: { name: branch.name },
      update: {
        code: branch.code,
        regional: branch.regional,
        city: branch.city,
        isActive: true
      },
      create: {
        ...branch,
        isActive: true
      }
    });
    branches.set(created.name, created.id);
  }

  for (const raw of sparepartSeeds) {
    const item = normalizeSeedRecord(raw);
    const branchId = branches.get(item.branchName);

    if (!branchId) {
      throw new Error(`Branch not found for seed: ${item.branchName}`);
    }

    const removedDate = item.removedDate ? new Date(`${item.removedDate}T00:00:00.000Z`) : null;
    const existing = await prisma.sparepart.findFirst({
      where: {
        pjpp: item.pjpp,
        branchId,
        removedDate,
        name: item.name,
        plateNumber: item.plateNumber
      },
      select: { id: true }
    });

    await prisma.sparepart.upsert({
      where: { id: existing?.id || "__new_sparepart_seed__" },
      update: {
        category: item.category,
        vehicleCode: item.vehicleCode,
        vehicleType: item.vehicleType,
        condition: item.condition,
        storageLocation: item.storageLocation,
        notes: item.notes
      },
      create: {
        pjpp: item.pjpp,
        branchId,
        removedDate,
        name: item.name,
        category: item.category,
        plateNumber: item.plateNumber,
        vehicleCode: item.vehicleCode,
        vehicleType: item.vehicleType,
        condition: item.condition,
        storageLocation: item.storageLocation,
        notes: item.notes
      }
    });
  }

  for (const raw of usedGoodsSeeds) {
    const item = normalizeUsedGoodsSeedRecord(raw);
    const branchId = branches.get(item.branchName);

    if (!branchId) {
      throw new Error(`Branch not found for used goods seed: ${item.branchName}`);
    }

    await prisma.usedGoods.upsert({
      where: { code: item.code },
      update: {
        branchId,
        inputDate: new Date(`${item.inputDate}T00:00:00.000Z`),
        name: item.name,
        category: item.category,
        qty: item.qty,
        unit: item.unit,
        estimatedWeightKg: item.estimatedWeightKg,
        estimatedPrice: item.estimatedPrice,
        condition: item.condition,
        storageLocation: item.storageLocation,
        pic: item.pic,
        notes: item.notes
      },
      create: {
        code: item.code,
        branchId,
        inputDate: new Date(`${item.inputDate}T00:00:00.000Z`),
        name: item.name,
        category: item.category,
        qty: item.qty,
        unit: item.unit,
        estimatedWeightKg: item.estimatedWeightKg,
        estimatedPrice: item.estimatedPrice,
        condition: item.condition,
        storageLocation: item.storageLocation,
        pic: item.pic,
        notes: item.notes
      }
    });
  }

  const demoBranchId = branches.get("IGR CIPUTAT");
  if (!demoBranchId) {
    throw new Error("Demo branch IGR CIPUTAT not found for user seed.");
  }

  const userSeeds = [
    {
      name: "Super Admin BARKAS",
      email: "superadmin@barkas.local",
      password: "SuperAdmin123!",
      role: "SUPER_ADMIN" as const,
      branchId: null
    },
    {
      name: "Admin Pusat INDOPAKET",
      email: "adminpusat@barkas.local",
      password: "AdminPusat123!",
      role: "ADMIN_PUSAT" as const,
      branchId: null
    },
    {
      name: "Admin Cabang IGR Ciputat",
      email: "admin.ciputat@barkas.local",
      password: "AdminCabang123!",
      role: "ADMIN_CABANG" as const,
      branchId: demoBranchId
    },
    {
      name: "Karyawan Cabang IGR Ciputat",
      email: "karyawan.ciputat@barkas.local",
      password: "Karyawan123!",
      role: "KARYAWAN_CABANG" as const,
      branchId: demoBranchId
    }
  ];

  for (const user of userSeeds) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        branchId: user.branchId,
        isActive: true
      },
      create: {
        name: user.name,
        email: user.email,
        passwordHash: hashPassword(user.password),
        role: user.role,
        branchId: user.branchId,
        isActive: true
      }
    });
  }

  const [total, layak, rusak, usedGoodsTotal, userTotal] = await Promise.all([
    prisma.sparepart.count(),
    prisma.sparepart.count({ where: { condition: "LAYAK_JUAL" } }),
    prisma.sparepart.count({ where: { condition: "RUSAK" } }),
    prisma.usedGoods.count(),
    prisma.user.count()
  ]);

  console.log(`Seed complete: ${total} sparepart, ${layak} LAYAK JUAL, ${rusak} RUSAK, ${usedGoodsTotal} barang bekas, ${userTotal} users.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
