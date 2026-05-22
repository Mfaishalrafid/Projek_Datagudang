"use server";

import { prisma } from "@/lib/prisma";
import { toBranchDTO, toSaleOrderDTO, toSparepartDTO, toUsedGoodsDTO } from "@/lib/mappers";
import type { DashboardStats, InitialData, UsedGoodsStats } from "@/lib/types";
import {
  saleOrderInputSchema,
  saleStatusSchema,
  sparepartFiltersSchema,
  sparepartInputSchema,
  sparepartUpdateSchema,
  usedGoodsFiltersSchema,
  usedGoodsInputSchema,
  type SaleOrderInput,
  type SparepartFilters,
  type SparepartInput,
  type SparepartUpdateInput,
  type UsedGoodsFilters,
  type UsedGoodsInput
} from "@/lib/validations";
import { usedGoodsCategoryLabels, vehicleTypeByCode } from "@/data/options";
import { buildUsedGoodsCsv } from "@/lib/csv";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import type { Prisma, UsedGoodsCategory } from "@prisma/client";

const sparepartInclude = {
  branch: true
} satisfies Prisma.SparepartInclude;

const saleOrderInclude = {
  sparepart: {
    include: {
      branch: true
    }
  }
} satisfies Prisma.SaleOrderInclude;

const usedGoodsInclude = {
  branch: true
} satisfies Prisma.UsedGoodsInclude;

function toDate(value: string | null | undefined) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

function buildWhere(filters: SparepartFilters): Prisma.SparepartWhereInput {
  const parsed = sparepartFiltersSchema.parse(filters) || {};
  const where: Prisma.SparepartWhereInput = {};

  if (parsed.condition) where.condition = parsed.condition;
  if (parsed.category) where.category = parsed.category;
  if (parsed.branchId) where.branchId = parsed.branchId;
  if (parsed.vehicleType) where.vehicleType = parsed.vehicleType;

  if (parsed.query) {
    where.OR = [
      { pjpp: { contains: parsed.query, mode: "insensitive" } },
      { name: { contains: parsed.query, mode: "insensitive" } },
      { plateNumber: { contains: parsed.query, mode: "insensitive" } }
    ];
  }

  return where;
}

function buildUsedGoodsWhere(filters: UsedGoodsFilters): Prisma.UsedGoodsWhereInput {
  const parsed = usedGoodsFiltersSchema.parse(filters) || {};
  const where: Prisma.UsedGoodsWhereInput = {};

  if (parsed.condition) where.condition = parsed.condition;
  if (parsed.category) where.category = parsed.category;
  if (parsed.branchId) where.branchId = parsed.branchId;

  if (parsed.query) {
    const query = parsed.query.toLowerCase();
    const matchingCategories = Object.entries(usedGoodsCategoryLabels)
      .filter(([, label]) => label.toLowerCase().includes(query))
      .map(([category]) => category as UsedGoodsCategory);

    where.OR = [
      { code: { contains: parsed.query, mode: "insensitive" } },
      { name: { contains: parsed.query, mode: "insensitive" } },
      { branch: { is: { name: { contains: parsed.query, mode: "insensitive" } } } },
      ...(matchingCategories.length ? [{ category: { in: matchingCategories } }] : [])
    ];
  }

  return where;
}

export async function listBranches() {
  noStore();
  const branches = await prisma.branch.findMany({
    orderBy: { name: "asc" }
  });
  return branches.map(toBranchDTO);
}

export async function listSpareparts(filters?: SparepartFilters) {
  noStore();
  const spareparts = await prisma.sparepart.findMany({
    where: buildWhere(filters),
    include: sparepartInclude,
    orderBy: [{ removedDate: "desc" }, { createdAt: "desc" }, { name: "asc" }]
  });

  return spareparts.map(toSparepartDTO);
}

export async function listSaleableSpareparts() {
  noStore();
  return listSpareparts({ condition: "LAYAK_JUAL" });
}

export async function listSaleOrders() {
  noStore();
  const orders = await prisma.saleOrder.findMany({
    include: saleOrderInclude,
    orderBy: [{ createdAt: "desc" }]
  });

  return orders.map(toSaleOrderDTO);
}

export async function listUsedGoods(filters?: UsedGoodsFilters) {
  noStore();
  const items = await prisma.usedGoods.findMany({
    where: buildUsedGoodsWhere(filters),
    include: usedGoodsInclude,
    orderBy: [{ inputDate: "desc" }, { createdAt: "desc" }, { name: "asc" }]
  });

  return items.map(toUsedGoodsDTO);
}

export async function getUsedGoodsStats(): Promise<UsedGoodsStats> {
  noStore();
  const [total, saleable, notSaleable, items, branches] = await Promise.all([
    prisma.usedGoods.count(),
    prisma.usedGoods.count({ where: { condition: "LAYAK_JUAL" } }),
    prisma.usedGoods.count({ where: { condition: "TIDAK_LAYAK" } }),
    prisma.usedGoods.findMany({
      select: {
        qty: true,
        estimatedWeightKg: true
      }
    }),
    prisma.usedGoods.findMany({
      distinct: ["branchId"],
      select: { branchId: true }
    })
  ]);

  return {
    total,
    totalQty: items.reduce((sum, item) => sum + Number(item.qty), 0),
    saleable,
    notSaleable,
    totalWeightKg: items.reduce((sum, item) => sum + Number(item.estimatedWeightKg || 0), 0),
    activeBranches: branches.length
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  noStore();
  const [total, saleable, damaged, activeBranches, plates, pjpps, usedGoods] = await Promise.all([
    prisma.sparepart.count(),
    prisma.sparepart.count({ where: { condition: "LAYAK_JUAL" } }),
    prisma.sparepart.count({ where: { condition: "RUSAK" } }),
    prisma.sparepart.findMany({
      distinct: ["branchId"],
      select: { branchId: true }
    }),
    prisma.sparepart.findMany({
      distinct: ["plateNumber"],
      select: { plateNumber: true }
    }),
    prisma.sparepart.findMany({
      distinct: ["pjpp"],
      select: { pjpp: true }
    }),
    getUsedGoodsStats()
  ]);

  return {
    total,
    saleable,
    damaged,
    activeBranches: activeBranches.length,
    uniquePlates: plates.length,
    uniquePjpp: pjpps.length,
    usedGoods
  };
}

export async function getReportData() {
  noStore();
  const [branches, spareparts, saleOrders, usedGoods, stats] = await Promise.all([
    listBranches(),
    listSpareparts(),
    listSaleOrders(),
    listUsedGoods(),
    getDashboardStats()
  ]);

  return {
    branches,
    spareparts,
    saleOrders,
    usedGoods,
    stats
  } satisfies InitialData;
}

export async function getUsedGoodsReportData() {
  noStore();
  const [items, stats] = await Promise.all([listUsedGoods(), getUsedGoodsStats()]);
  return { items, stats };
}

export async function createSparepart(data: SparepartInput) {
  const parsed = sparepartInputSchema.parse(data);
  const branch = await prisma.branch.findUnique({
    where: { id: parsed.branchId }
  });

  if (!branch) {
    throw new Error("Cabang tidak ditemukan.");
  }

  const created = await prisma.sparepart.create({
    data: {
      pjpp: parsed.pjpp,
      branchId: parsed.branchId,
      removedDate: toDate(parsed.removedDate),
      name: parsed.name,
      category: parsed.category,
      plateNumber: parsed.plateNumber.toUpperCase(),
      vehicleCode: parsed.vehicleCode,
      vehicleType: vehicleTypeByCode[parsed.vehicleCode],
      condition: parsed.condition,
      storageLocation: parsed.storageLocation || branch.name,
      notes: parsed.notes || null
    },
    include: sparepartInclude
  });

  revalidatePath("/");
  return toSparepartDTO(created);
}

export async function updateSparepart(id: string, data: SparepartUpdateInput) {
  const parsed = sparepartUpdateSchema.parse({ ...data, id });
  const branch = parsed.branchId
    ? await prisma.branch.findUnique({ where: { id: parsed.branchId } })
    : null;

  if (parsed.branchId && !branch) {
    throw new Error("Cabang tidak ditemukan.");
  }

  const updateData: Prisma.SparepartUpdateInput = {
    pjpp: parsed.pjpp,
    branch: parsed.branchId ? { connect: { id: parsed.branchId } } : undefined,
    removedDate: parsed.removedDate === undefined ? undefined : toDate(parsed.removedDate),
    name: parsed.name,
    category: parsed.category,
    plateNumber: parsed.plateNumber ? parsed.plateNumber.toUpperCase() : undefined,
    vehicleCode: parsed.vehicleCode,
    vehicleType: parsed.vehicleCode ? vehicleTypeByCode[parsed.vehicleCode] : parsed.vehicleType,
    condition: parsed.condition,
    storageLocation: parsed.storageLocation || undefined,
    notes: parsed.notes ?? undefined
  };

  const updated = await prisma.sparepart.update({
    where: { id },
    data: updateData,
    include: sparepartInclude
  });

  revalidatePath("/");
  return toSparepartDTO(updated);
}

export async function deleteSparepart(id: string) {
  await prisma.sparepart.delete({
    where: { id }
  });

  revalidatePath("/");
  return { id };
}

async function generateUsedGoodsCode(inputDate: string) {
  const datePart = inputDate.replaceAll("-", "");
  const prefix = `BB-${datePart}`;
  const countForDate = await prisma.usedGoods.count({
    where: {
      code: {
        startsWith: prefix
      }
    }
  });

  return `${prefix}-${String(countForDate + 1).padStart(4, "0")}`;
}

export async function createUsedGoods(data: UsedGoodsInput) {
  const parsed = usedGoodsInputSchema.parse(data);
  const branch = await prisma.branch.findUnique({
    where: { id: parsed.branchId }
  });

  if (!branch) {
    throw new Error("Cabang / lokasi asal tidak ditemukan.");
  }

  const inputDate = parsed.inputDate || new Date().toISOString().slice(0, 10);
  const code = await generateUsedGoodsCode(inputDate);

  const created = await prisma.usedGoods.create({
    data: {
      code,
      branchId: parsed.branchId,
      inputDate: toDate(inputDate) || new Date(),
      name: parsed.name,
      category: parsed.category,
      qty: parsed.qty,
      unit: parsed.unit,
      estimatedWeightKg: parsed.estimatedWeightKg,
      estimatedPrice: parsed.estimatedPrice,
      condition: parsed.condition,
      storageLocation: parsed.storageLocation || null,
      pic: parsed.pic || null,
      notes: parsed.notes || null
    },
    include: usedGoodsInclude
  });

  revalidatePath("/");
  return toUsedGoodsDTO(created);
}

export async function deleteUsedGoods(id: string) {
  await prisma.usedGoods.delete({
    where: { id }
  });

  revalidatePath("/");
  return { id };
}

export async function exportUsedGoodsCsv(filters?: UsedGoodsFilters) {
  const items = await listUsedGoods(filters);
  return buildUsedGoodsCsv(items);
}

export async function createSaleOrder(data: SaleOrderInput) {
  const parsed = saleOrderInputSchema.parse(data);
  const sparepart = await prisma.sparepart.findUnique({
    where: { id: parsed.sparepartId },
    include: sparepartInclude
  });

  if (!sparepart) {
    throw new Error("Sparepart tidak ditemukan.");
  }

  if (sparepart.condition !== "LAYAK_JUAL") {
    throw new Error("Order jual hanya dapat dibuat untuk sparepart LAYAK JUAL.");
  }

  const created = await prisma.saleOrder.create({
    data: {
      sparepartId: parsed.sparepartId,
      buyerName: parsed.buyerName,
      buyerType: parsed.buyerType,
      price: parsed.price,
      saleDate: toDate(parsed.saleDate) || new Date(),
      status: parsed.status
    },
    include: saleOrderInclude
  });

  revalidatePath("/");
  return toSaleOrderDTO(created);
}

export async function updateSaleOrderStatus(id: string, status: unknown) {
  const parsed = saleStatusSchema.parse(status);
  const updated = await prisma.saleOrder.update({
    where: { id },
    data: { status: parsed },
    include: saleOrderInclude
  });

  revalidatePath("/");
  return toSaleOrderDTO(updated);
}
