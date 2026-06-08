import { PrismaClient } from "@prisma/client";
import { branchSeeds } from "../src/data/options";
import {
  normalizeSeedRecord,
  normalizeUsedGoodsSeedRecord,
  sparepartSeeds,
  usedGoodsSeeds
} from "../src/data/seed-data";
import { hashPassword } from "../src/lib/password";
import { normalizeTlsNumber } from "../src/lib/sga";

const prisma = new PrismaClient();

async function main() {
  const branches = new Map<string, string>();

  for (const branch of branchSeeds) {
    const existing = await prisma.branch.findFirst({
      where: {
        OR: [
          { name: branch.name },
          ...(branch.code ? [{ code: branch.code }] : [])
        ]
      }
    });
    const created = existing
      ? await prisma.branch.update({
        where: { id: existing.id },
        data: {
          name: branch.name,
          code: branch.code,
          regional: branch.regional,
          city: branch.city,
          isActive: true
        }
      })
      : await prisma.branch.create({
        data: {
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

  const sgaSeeds = [
    {
      tlsNumber: "TLS-2026-001",
      branchName: "IGR CIPUTAT",
      inputDate: "2026-06-01",
      itemName: "Meja kantor bekas",
      quantity: 5,
      picName: "Ardi",
      eligibilityStatus: "LAYAK_JUAL" as const,
      transactionStatus: "TERSEDIA" as const,
      note: null
    },
    {
      tlsNumber: "TLS-2026-002",
      branchName: "IGR BANDUNG KOTA",
      inputDate: "2026-06-02",
      itemName: "Kursi tunggu bekas",
      quantity: 10,
      picName: "Budi",
      eligibilityStatus: "LAYAK_JUAL" as const,
      transactionStatus: "TERSEDIA" as const,
      note: null
    },
    {
      tlsNumber: "TLS-2026-003",
      branchName: "GW Cargo TGR",
      inputDate: "2026-06-03",
      itemName: "Rak arsip rusak",
      quantity: 2,
      picName: "Sari",
      eligibilityStatus: "TIDAK_LAYAK" as const,
      transactionStatus: "TERSEDIA" as const,
      note: "Tidak layak dijual"
    }
  ];

  for (const item of sgaSeeds) {
    const branchId = branches.get(item.branchName);
    if (!branchId) {
      throw new Error(`Branch not found for SGA seed: ${item.branchName}`);
    }

    await prisma.sgaItem.upsert({
      where: { tlsNumber: normalizeTlsNumber(item.tlsNumber) },
      update: {
        branchId,
        inputDate: new Date(`${item.inputDate}T00:00:00.000Z`),
        itemName: item.itemName,
        quantity: item.quantity,
        picName: item.picName,
        eligibilityStatus: item.eligibilityStatus,
        transactionStatus: item.transactionStatus,
        note: item.note
      },
      create: {
        tlsNumber: normalizeTlsNumber(item.tlsNumber),
        branchId,
        inputDate: new Date(`${item.inputDate}T00:00:00.000Z`),
        itemName: item.itemName,
        quantity: item.quantity,
        picName: item.picName,
        eligibilityStatus: item.eligibilityStatus,
        transactionStatus: item.transactionStatus,
        note: item.note
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

  const [total, layak, rusak, usedGoodsTotal, sgaTotal, userTotal] = await Promise.all([
    prisma.sparepart.count(),
    prisma.sparepart.count({ where: { condition: "LAYAK_JUAL" } }),
    prisma.sparepart.count({ where: { condition: "RUSAK" } }),
    prisma.usedGoods.count(),
    prisma.sgaItem.count(),
    prisma.user.count()
  ]);

  console.log(`Seed complete: ${total} sparepart, ${layak} LAYAK JUAL, ${rusak} RUSAK, ${usedGoodsTotal} barang bekas, ${sgaTotal} SGA, ${userTotal} users.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
