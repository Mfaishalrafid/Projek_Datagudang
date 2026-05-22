import { PrismaClient } from "@prisma/client";
import { branchSeeds } from "../src/data/options";
import {
  normalizeSeedRecord,
  normalizeUsedGoodsSeedRecord,
  sparepartSeeds,
  usedGoodsSeeds
} from "../src/data/seed-data";

const prisma = new PrismaClient();

async function main() {
  await prisma.saleOrder.deleteMany();
  await prisma.sparepart.deleteMany();
  await prisma.usedGoods.deleteMany();

  const branches = new Map<string, string>();

  for (const branch of branchSeeds) {
    const created = await prisma.branch.upsert({
      where: { name: branch.name },
      update: { code: branch.code },
      create: branch
    });
    branches.set(created.name, created.id);
  }

  for (const raw of sparepartSeeds) {
    const item = normalizeSeedRecord(raw);
    const branchId = branches.get(item.branchName);

    if (!branchId) {
      throw new Error(`Branch not found for seed: ${item.branchName}`);
    }

    await prisma.sparepart.create({
      data: {
        pjpp: item.pjpp,
        branchId,
        removedDate: item.removedDate ? new Date(`${item.removedDate}T00:00:00.000Z`) : null,
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

  const [total, layak, rusak, usedGoodsTotal] = await Promise.all([
    prisma.sparepart.count(),
    prisma.sparepart.count({ where: { condition: "LAYAK_JUAL" } }),
    prisma.sparepart.count({ where: { condition: "RUSAK" } }),
    prisma.usedGoods.count()
  ]);

  console.log(`Seed complete: ${total} sparepart, ${layak} LAYAK JUAL, ${rusak} RUSAK, ${usedGoodsTotal} barang bekas.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
