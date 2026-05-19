import { PrismaClient } from "@prisma/client";
import { branchSeeds } from "../src/data/options";
import { normalizeSeedRecord, sparepartSeeds } from "../src/data/seed-data";

const prisma = new PrismaClient();

async function main() {
  await prisma.saleOrder.deleteMany();
  await prisma.sparepart.deleteMany();
  await prisma.branch.deleteMany();

  const branches = new Map<string, string>();

  for (const branch of branchSeeds) {
    const created = await prisma.branch.create({
      data: branch
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

  const [total, layak, rusak] = await Promise.all([
    prisma.sparepart.count(),
    prisma.sparepart.count({ where: { condition: "LAYAK_JUAL" } }),
    prisma.sparepart.count({ where: { condition: "RUSAK" } })
  ]);

  console.log(`Seed complete: ${total} sparepart, ${layak} LAYAK JUAL, ${rusak} RUSAK.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
