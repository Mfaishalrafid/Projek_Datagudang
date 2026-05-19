"use server";

import { prisma } from "@/lib/prisma";
import { toBranchDTO, toSaleOrderDTO, toSparepartDTO } from "@/lib/mappers";
import type { DashboardStats, InitialData } from "@/lib/types";
import {
  saleOrderInputSchema,
  saleStatusSchema,
  sparepartFiltersSchema,
  sparepartInputSchema,
  sparepartUpdateSchema,
  type SaleOrderInput,
  type SparepartFilters,
  type SparepartInput,
  type SparepartUpdateInput
} from "@/lib/validations";
import { vehicleTypeByCode } from "@/data/options";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import type { Prisma } from "@prisma/client";

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

export async function getDashboardStats(): Promise<DashboardStats> {
  noStore();
  const [total, saleable, damaged, activeBranches, plates, pjpps] = await Promise.all([
    prisma.sparepart.count(),
    prisma.sparepart.count({ where: { condition: "LAYAK_JUAL" } }),
    prisma.sparepart.count({ where: { condition: "RUSAK" } }),
    prisma.branch.count(),
    prisma.sparepart.findMany({
      distinct: ["plateNumber"],
      select: { plateNumber: true }
    }),
    prisma.sparepart.findMany({
      distinct: ["pjpp"],
      select: { pjpp: true }
    })
  ]);

  return {
    total,
    saleable,
    damaged,
    activeBranches,
    uniquePlates: plates.length,
    uniquePjpp: pjpps.length
  };
}

export async function getReportData() {
  noStore();
  const [branches, spareparts, saleOrders, stats] = await Promise.all([
    listBranches(),
    listSpareparts(),
    listSaleOrders(),
    getDashboardStats()
  ]);

  return {
    branches,
    spareparts,
    saleOrders,
    stats
  } satisfies InitialData;
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
