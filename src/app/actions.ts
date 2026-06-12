"use server";

import { prisma } from "@/lib/prisma";
import { toBranchDTO, toSaleOrderDTO, toSgaItemDTO, toSgaSaleOrderDTO, toSparepartDTO, toUsedGoodsDTO, toUsedGoodsSaleOrderDTO, toUserDTO } from "@/lib/mappers";
import type { DashboardStats, InitialData, SgaStats, UsedGoodsStats } from "@/lib/types";
import {
  branchInputSchema,
  branchUpdateSchema,
  loginSchema,
  passwordResetSchema,
  saleOrderInputSchema,
  saleStatusSchema,
  sgaFiltersSchema,
  sgaInputSchema,
  sgaSaleOrderInputSchema,
  sgaUpdateSchema,
  sparepartFiltersSchema,
  sparepartInputSchema,
  sparepartUpdateSchema,
  userCreateSchema,
  userUpdateSchema,
  usedGoodsFiltersSchema,
  usedGoodsInputSchema,
  usedGoodsUpdateSchema,
  usedGoodsSaleOrderInputSchema,
  type BranchInput,
  type BranchUpdateInput,
  type PasswordResetInput,
  type SaleOrderInput,
  type SgaFilters,
  type SgaInput,
  type SgaSaleOrderInput,
  type SgaUpdateInput,
  type SparepartFilters,
  type SparepartInput,
  type SparepartUpdateInput,
  type UserCreateInput,
  type UserUpdateInput,
  type UsedGoodsFilters,
  type UsedGoodsInput,
  type UsedGoodsUpdateInput,
  type UsedGoodsSaleOrderInput
} from "@/lib/validations";
import { sgaEligibilityStatusLabels, sgaTransactionStatusLabels, usedGoodsCategoryLabels, vehicleTypeByCode } from "@/data/options";
import { buildSgaCsv, buildUsedGoodsCsv } from "@/lib/csv";
import { calculateDashboardStatsFromData } from "@/lib/dashboard-stats";
import { calculateSgaStats } from "@/lib/sga-analytics";
import { calculateUsedGoodsStats } from "@/lib/used-goods-analytics";
import { buildUsedGoodsSaleIndex, getUsedGoodsSaleAvailability } from "@/lib/sale-availability";
import { clearSessionCookie, requireActionUser, setSessionCookie, toSessionUser } from "@/lib/auth";
import {
  applyBranchScope,
  canAccessSga,
  canAssignRole,
  canCreateOrder,
  canDeleteOperationalData,
  canExportData,
  canManageBranches,
  canManageTargetUser,
  canManageUsers,
  resolveWriteBranchId,
  type SessionUser
} from "@/lib/access-control";
import { normalizeTlsNumber } from "@/lib/sga";
import { hashPassword, verifyPassword } from "@/lib/password";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma, SgaEligibilityStatus, SgaTransactionStatus, UsedGoodsCategory } from "@prisma/client";

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

const usedGoodsSaleOrderInclude = {
  usedGoods: {
    include: {
      branch: true
    }
  }
} satisfies Prisma.UsedGoodsSaleOrderInclude;

const sgaInclude = {
  branch: true
} satisfies Prisma.SgaItemInclude;

const sgaSaleOrderInclude = {
  sgaItem: {
    include: {
      branch: true
    }
  }
} satisfies Prisma.SgaSaleOrderInclude;

function toDate(value: string | null | undefined) {
  return value ? new Date(`${value}T00:00:00.000Z`) : null;
}

async function getActor(actor?: SessionUser) {
  return actor || requireActionUser();
}

async function resolveActiveBranchForWrite(user: SessionUser, requestedBranchId?: string | null) {
  const branchId = resolveWriteBranchId(user, requestedBranchId);
  const branch = await prisma.branch.findFirst({
    where: { id: branchId, isActive: true }
  });

  if (!branch) {
    throw new Error("Cabang tidak ditemukan atau sedang nonaktif.");
  }

  return { branchId, branch };
}

async function assertCanAccessSparepart(user: SessionUser, id: string) {
  const sparepart = await prisma.sparepart.findUnique({
    where: { id },
    include: sparepartInclude
  });

  if (!sparepart) throw new Error("Sparepart tidak ditemukan.");
  if ((user.role === "ADMIN_CABANG" || user.role === "KARYAWAN_CABANG") && sparepart.branchId !== user.branchId) {
    throw new Error("Anda tidak memiliki akses ke data cabang lain.");
  }

  return sparepart;
}

async function assertCanAccessUsedGoods(user: SessionUser, id: string) {
  const item = await prisma.usedGoods.findUnique({
    where: { id },
    include: usedGoodsInclude
  });

  if (!item) throw new Error("Barang bekas tidak ditemukan.");
  if ((user.role === "ADMIN_CABANG" || user.role === "KARYAWAN_CABANG") && item.branchId !== user.branchId) {
    throw new Error("Anda tidak memiliki akses ke data cabang lain.");
  }

  return item;
}

async function assertCanAccessSgaItem(user: SessionUser, id: string) {
  if (!canAccessSga(user)) {
    throw new Error("Role Anda tidak dapat mengakses SGA.");
  }

  const item = await prisma.sgaItem.findUnique({
    where: { id },
    include: sgaInclude
  });

  if (!item) throw new Error("Data SGA tidak ditemukan.");
  if ((user.role === "ADMIN_CABANG" || user.role === "KARYAWAN_CABANG") && item.branchId !== user.branchId) {
    throw new Error("Anda tidak memiliki akses ke data cabang lain.");
  }
  return item;
}

async function getSparepartActiveSaleOrder(sparepartId: string) {
  return prisma.saleOrder.findFirst({
    where: {
      sparepartId,
      status: { in: ["APPROVAL", "TERJUAL"] }
    },
    orderBy: { createdAt: "desc" }
  });
}

async function getUsedGoodsActiveSaleOrders(usedGoodsId: string) {
  return prisma.usedGoodsSaleOrder.findMany({
    where: {
      usedGoodsId,
      status: { in: ["APPROVAL", "TERJUAL"] }
    },
    select: {
      qty: true,
      status: true
    }
  });
}

function assertSparepartUnlocked(order: { status: string } | null, action: "diubah" | "dihapus") {
  if (order?.status === "APPROVAL") {
    throw new Error(`Sparepart sudah dalam order dan tidak dapat ${action}.`);
  }
  if (order?.status === "TERJUAL") {
    throw new Error(`Sparepart sudah terjual dan tidak dapat ${action}.`);
  }
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

function buildSgaWhere(filters: SgaFilters): Prisma.SgaItemWhereInput {
  const parsed = sgaFiltersSchema.parse(filters) || {};
  const where: Prisma.SgaItemWhereInput = {};

  if (parsed.eligibilityStatus) where.eligibilityStatus = parsed.eligibilityStatus;
  if (parsed.transactionStatus) where.transactionStatus = parsed.transactionStatus;
  if (parsed.branchId) where.branchId = parsed.branchId;
  if (parsed.tlsNumber) where.tlsNumber = { contains: parsed.tlsNumber, mode: "insensitive" };

  if (parsed.query) {
    where.OR = [
      { tlsNumber: { contains: parsed.query, mode: "insensitive" } },
      { itemName: { contains: parsed.query, mode: "insensitive" } },
      { picName: { contains: parsed.query, mode: "insensitive" } },
      { note: { contains: parsed.query, mode: "insensitive" } },
      { branch: { is: { name: { contains: parsed.query, mode: "insensitive" } } } },
      { branch: { is: { code: { contains: parsed.query, mode: "insensitive" } } } },
      ...buildSgaStatusSearchConditions(parsed.query)
    ];
  }

  return where;
}

function buildSgaStatusSearchConditions(query: string): Prisma.SgaItemWhereInput[] {
  const normalizedQuery = normalizeSgaSearchText(query);
  const eligibilityMatches = Object.entries(sgaEligibilityStatusLabels)
    .filter(([value, label]) => matchesSgaSearchLabel(normalizedQuery, value, label))
    .map(([value]) => ({ eligibilityStatus: value as SgaEligibilityStatus }));
  const transactionMatches = Object.entries(sgaTransactionStatusLabels)
    .filter(([value, label]) => matchesSgaSearchLabel(normalizedQuery, value, label))
    .map(([value]) => ({ transactionStatus: value as SgaTransactionStatus }));

  return [...eligibilityMatches, ...transactionMatches];
}

function matchesSgaSearchLabel(query: string, value: string, label: string) {
  return normalizeSgaSearchText(value).includes(query) || normalizeSgaSearchText(label).includes(query);
}

function normalizeSgaSearchText(value: string) {
  return value.toLowerCase().replace(/_/g, " ").replace(/\s+/g, " ").trim();
}

function assertSgaCentralAccess(user: SessionUser) {
  if (!canCreateOrder(user)) {
    throw new Error("Role cabang tidak dapat membuat order jual.");
  }
}

function assertSgaAccess(user: SessionUser) {
  if (!canAccessSga(user)) {
    throw new Error("Role Anda tidak dapat mengakses SGA.");
  }
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    redirect("/login?error=invalid");
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: { branch: true }
  });

  if (!user || !user.isActive || !verifyPassword(parsed.data.password, user.passwordHash)) {
    redirect("/login?error=invalid");
  }

  if ((user.role === "ADMIN_CABANG" || user.role === "KARYAWAN_CABANG") && !user.branchId) {
    redirect("/login?error=branch");
  }

  setSessionCookie(toSessionUser(user));
  redirect("/dashboard");
}

export async function logoutAction() {
  clearSessionCookie();
  redirect("/login");
}

export async function listBranches(actor?: SessionUser) {
  noStore();
  const user = await getActor(actor);
  const where: Prisma.BranchWhereInput =
    user.role === "ADMIN_CABANG" || user.role === "KARYAWAN_CABANG"
      ? { id: user.branchId || "__missing_branch__", isActive: true }
      : {};

  const branches = await prisma.branch.findMany({
    where,
    orderBy: { name: "asc" }
  });
  return branches.map(toBranchDTO);
}

export async function listSpareparts(filters?: SparepartFilters, actor?: SessionUser) {
  noStore();
  const user = await getActor(actor);
  const spareparts = await prisma.sparepart.findMany({
    where: applyBranchScope(user, buildWhere(filters)),
    include: sparepartInclude,
    orderBy: [{ removedDate: "desc" }, { createdAt: "desc" }, { name: "asc" }]
  });

  return spareparts.map(toSparepartDTO);
}

export async function listSaleableSpareparts(actor?: SessionUser) {
  noStore();
  const user = await getActor(actor);
  if (!canCreateOrder(user)) {
    throw new Error("Role cabang tidak dapat mengakses Layak Jual.");
  }
  return listSpareparts({ condition: "LAYAK_JUAL" }, user);
}

export async function listSaleOrders(actor?: SessionUser) {
  noStore();
  const user = await getActor(actor);
  if (!canCreateOrder(user)) {
    return [];
  }

  const orders = await prisma.saleOrder.findMany({
    include: saleOrderInclude,
    orderBy: [{ createdAt: "desc" }]
  });

  return orders.map(toSaleOrderDTO);
}

export async function listUsedGoodsSaleOrders(actor?: SessionUser) {
  noStore();
  const user = await getActor(actor);
  if (!canCreateOrder(user)) {
    return [];
  }

  const orders = await prisma.usedGoodsSaleOrder.findMany({
    include: usedGoodsSaleOrderInclude,
    orderBy: [{ createdAt: "desc" }]
  });

  return orders.map(toUsedGoodsSaleOrderDTO);
}

export async function listSgaSaleOrders(actor?: SessionUser) {
  noStore();
  const user = await getActor(actor);
  if (!canCreateOrder(user)) {
    return [];
  }

  const orders = await prisma.sgaSaleOrder.findMany({
    include: sgaSaleOrderInclude,
    orderBy: [{ createdAt: "desc" }]
  });

  return orders.map(toSgaSaleOrderDTO);
}

export async function listUsedGoods(filters?: UsedGoodsFilters, actor?: SessionUser) {
  noStore();
  const user = await getActor(actor);
  const items = await prisma.usedGoods.findMany({
    where: applyBranchScope(user, buildUsedGoodsWhere(filters)),
    include: usedGoodsInclude,
    orderBy: [{ inputDate: "desc" }, { createdAt: "desc" }, { name: "asc" }]
  });

  return items.map(toUsedGoodsDTO);
}

export async function listSgaItems(filters?: SgaFilters, actor?: SessionUser) {
  noStore();
  const user = await getActor(actor);
  assertSgaAccess(user);
  const items = await prisma.sgaItem.findMany({
    where: applyBranchScope(user, buildSgaWhere(filters)),
    include: sgaInclude,
    orderBy: [{ inputDate: "desc" }, { createdAt: "desc" }, { tlsNumber: "asc" }]
  });

  return items.map(toSgaItemDTO);
}

export async function listSaleableSgaItems(actor?: SessionUser) {
  noStore();
  const user = await getActor(actor);
  assertSgaAccess(user);
  return listSgaItems({ eligibilityStatus: "LAYAK_JUAL" }, user);
}

export async function getUsedGoodsStats(actor?: SessionUser): Promise<UsedGoodsStats> {
  noStore();
  const user = await getActor(actor);
  const where = applyBranchScope(user, {} satisfies Prisma.UsedGoodsWhereInput);
  const items = await prisma.usedGoods.findMany({
    where,
    select: {
      branchId: true,
      qty: true,
      estimatedWeightKg: true,
      condition: true
    }
  });

  return calculateUsedGoodsStats(items);
}

export async function getSgaStats(actor?: SessionUser): Promise<SgaStats> {
  noStore();
  const user = await getActor(actor);
  assertSgaAccess(user);
  const where = applyBranchScope(user, {} satisfies Prisma.SgaItemWhereInput);
  const items = await prisma.sgaItem.findMany({
    where,
    select: {
      branchId: true,
      quantity: true,
      eligibilityStatus: true,
      transactionStatus: true
    }
  });

  return calculateSgaStats(items);
}

export async function getDashboardStats(actor?: SessionUser): Promise<DashboardStats> {
  noStore();
  const user = await getActor(actor);
  const sparepartWhere = applyBranchScope(user, {} satisfies Prisma.SparepartWhereInput);
  const usedGoodsWhere = applyBranchScope(user, {} satisfies Prisma.UsedGoodsWhereInput);
  const sgaWhere = applyBranchScope(user, {} satisfies Prisma.SgaItemWhereInput);
  const [spareparts, usedGoods, sgaItems] = await Promise.all([
    prisma.sparepart.findMany({
      where: sparepartWhere,
      select: {
        branchId: true,
        plateNumber: true,
        pjpp: true,
        condition: true
      }
    }),
    prisma.usedGoods.findMany({
      where: usedGoodsWhere,
      select: {
        branchId: true,
        qty: true,
        estimatedWeightKg: true,
        condition: true
      }
    }),
    canAccessSga(user)
      ? prisma.sgaItem.findMany({
          where: sgaWhere,
          select: {
            branchId: true,
            quantity: true,
            eligibilityStatus: true,
            transactionStatus: true
          }
        })
      : Promise.resolve([])
  ]);

  return calculateDashboardStatsFromData(spareparts, usedGoods, sgaItems);
}

export async function listUsers(actor?: SessionUser) {
  noStore();
  const user = await getActor(actor);
  if (!canManageUsers(user)) return [];

  const users = await prisma.user.findMany({
    where: user.role === "ADMIN_PUSAT" ? { role: { not: "SUPER_ADMIN" } } : {},
    include: { branch: true },
    orderBy: [{ role: "asc" }, { name: "asc" }]
  });

  return users.map(toUserDTO);
}

export async function getReportData(actor?: SessionUser) {
  noStore();
  const user = await getActor(actor);
  const canUseSga = canAccessSga(user);
  const [branches, spareparts, saleOrders, usedGoodsSaleOrders, sgaSaleOrders, usedGoods, sgaItems, users] = await Promise.all([
    listBranches(user),
    listSpareparts(undefined, user),
    listSaleOrders(user),
    listUsedGoodsSaleOrders(user),
    canUseSga ? listSgaSaleOrders(user) : Promise.resolve([]),
    listUsedGoods(undefined, user),
    canUseSga ? listSgaItems(undefined, user) : Promise.resolve([]),
    listUsers(user)
  ]);
  const stats = calculateDashboardStatsFromData(spareparts, usedGoods, sgaItems);

  return {
    currentUser: user,
    branches,
    spareparts,
    saleOrders,
    usedGoodsSaleOrders,
    sgaSaleOrders,
    usedGoods,
    sgaItems,
    users,
    stats
  } satisfies InitialData;
}

export async function getUsedGoodsReportData(actor?: SessionUser) {
  noStore();
  const user = await getActor(actor);
  const items = await listUsedGoods(undefined, user);
  return { items, stats: calculateUsedGoodsStats(items) };
}

export async function getSgaReportData(actor?: SessionUser) {
  noStore();
  const user = await getActor(actor);
  assertSgaAccess(user);
  const items = await listSgaItems(undefined, user);
  return { items, stats: calculateSgaStats(items) };
}

export async function createSparepart(data: SparepartInput) {
  const user = await getActor();
  const parsed = sparepartInputSchema.parse(data);
  const { branchId, branch } = await resolveActiveBranchForWrite(user, parsed.branchId);

  const created = await prisma.sparepart.create({
    data: {
      pjpp: parsed.pjpp,
      branchId,
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
  const user = await getActor();
  await assertCanAccessSparepart(user, id);
  const existingOrder = await getSparepartActiveSaleOrder(id);
  assertSparepartUnlocked(existingOrder, "diubah");
  const parsed = sparepartUpdateSchema.parse({ ...data, id });
  const branchInfo = parsed.branchId ? await resolveActiveBranchForWrite(user, parsed.branchId) : null;

  const updateData: Prisma.SparepartUpdateInput = {
    pjpp: parsed.pjpp,
    branch: branchInfo ? { connect: { id: branchInfo.branchId } } : undefined,
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
  const user = await getActor();
  if (!canDeleteOperationalData(user)) {
    throw new Error("Role Anda tidak dapat menghapus data.");
  }
  await assertCanAccessSparepart(user, id);
  const existingOrder = await getSparepartActiveSaleOrder(id);
  assertSparepartUnlocked(existingOrder, "dihapus");

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
  const user = await getActor();
  const parsed = usedGoodsInputSchema.parse(data);
  const { branchId } = await resolveActiveBranchForWrite(user, parsed.branchId);

  const inputDate = parsed.inputDate || new Date().toISOString().slice(0, 10);
  const code = await generateUsedGoodsCode(inputDate);

  const created = await prisma.usedGoods.create({
    data: {
      code,
      branchId,
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

export async function updateUsedGoods(id: string, data: UsedGoodsUpdateInput) {
  const user = await getActor();
  const existing = await assertCanAccessUsedGoods(user, id);
  const parsed = usedGoodsUpdateSchema.parse({ ...data, id });
  const activeOrders = await getUsedGoodsActiveSaleOrders(id);
  const hasTransaction = activeOrders.length > 0;

  if (hasTransaction) {
    const protectedChanged =
      (parsed.branchId !== undefined && parsed.branchId !== existing.branchId) ||
      (parsed.name !== undefined && parsed.name !== existing.name) ||
      (parsed.category !== undefined && parsed.category !== existing.category) ||
      (parsed.qty !== undefined && Number(parsed.qty) !== Number(existing.qty)) ||
      (parsed.unit !== undefined && parsed.unit !== existing.unit) ||
      (parsed.condition !== undefined && parsed.condition !== existing.condition);

    if (protectedChanged) {
      throw new Error("Barang bekas sudah memiliki transaksi; cabang, nama, kategori, qty, satuan, dan kondisi tidak dapat diubah.");
    }
  }

  const branchInfo = !hasTransaction && parsed.branchId ? await resolveActiveBranchForWrite(user, parsed.branchId) : null;
  const updateData: Prisma.UsedGoodsUpdateInput = {
    branch: branchInfo ? { connect: { id: branchInfo.branchId } } : undefined,
    inputDate: parsed.inputDate === undefined ? undefined : toDate(parsed.inputDate) || undefined,
    name: hasTransaction ? undefined : parsed.name,
    category: hasTransaction ? undefined : parsed.category,
    qty: hasTransaction ? undefined : parsed.qty,
    unit: hasTransaction ? undefined : parsed.unit,
    estimatedWeightKg: parsed.estimatedWeightKg === undefined ? undefined : parsed.estimatedWeightKg,
    estimatedPrice: parsed.estimatedPrice === undefined ? undefined : parsed.estimatedPrice,
    condition: hasTransaction ? undefined : parsed.condition,
    storageLocation: parsed.storageLocation === undefined ? undefined : parsed.storageLocation || null,
    pic: parsed.pic === undefined ? undefined : parsed.pic || null,
    notes: parsed.notes === undefined ? undefined : parsed.notes || null
  };

  const updated = await prisma.usedGoods.update({
    where: { id },
    data: updateData,
    include: usedGoodsInclude
  });

  revalidatePath("/");
  return toUsedGoodsDTO(updated);
}

export async function deleteUsedGoods(id: string) {
  const user = await getActor();
  if (!canDeleteOperationalData(user)) {
    throw new Error("Role Anda tidak dapat menghapus data.");
  }
  await assertCanAccessUsedGoods(user, id);
  const activeOrders = await getUsedGoodsActiveSaleOrders(id);
  if (activeOrders.length > 0) {
    throw new Error("Barang bekas sudah memiliki transaksi dan tidak dapat dihapus.");
  }

  await prisma.usedGoods.delete({
    where: { id }
  });

  revalidatePath("/");
  return { id };
}

export async function exportUsedGoodsCsv(filters?: UsedGoodsFilters) {
  const user = await getActor();
  if (!canExportData(user)) {
    throw new Error("Role Anda tidak dapat melakukan export data.");
  }
  const items = await listUsedGoods(filters, user);
  return buildUsedGoodsCsv(items);
}

export async function createSgaItem(data: SgaInput) {
  const user = await getActor();
  assertSgaAccess(user);
  const parsed = sgaInputSchema.parse(data);
  const { branchId } = await resolveActiveBranchForWrite(user, parsed.branchId);

  const existing = await prisma.sgaItem.findUnique({
    where: { tlsNumber: parsed.tlsNumber }
  });
  if (existing) {
    throw new Error("Nomor TLS sudah terdata. Silakan gunakan Nomor TLS lain.");
  }

  const created = await prisma.sgaItem.create({
    data: {
      tlsNumber: parsed.tlsNumber,
      branchId,
      inputDate: toDate(parsed.inputDate) || new Date(),
      itemName: parsed.itemName,
      quantity: parsed.quantity,
      picName: parsed.picName,
      eligibilityStatus: parsed.eligibilityStatus,
      transactionStatus: "TERSEDIA",
      note: parsed.note || null,
      createdById: user.id
    },
    include: sgaInclude
  });

  revalidatePath("/");
  return toSgaItemDTO(created);
}

export async function updateSgaItem(id: string, data: SgaUpdateInput) {
  const user = await getActor();
  if (user.role === "KARYAWAN_CABANG") {
    throw new Error("Role Anda tidak dapat mengedit data SGA.");
  }
  const existing = await assertCanAccessSgaItem(user, id);
  if (existing.transactionStatus !== "TERSEDIA") {
    throw new Error("Data SGA sudah dalam order atau terjual dan tidak dapat diedit.");
  }

  const parsed = sgaUpdateSchema.parse({ ...data, id });
  const normalizedTls = parsed.tlsNumber ? normalizeTlsNumber(parsed.tlsNumber) : undefined;
  if (normalizedTls && normalizedTls !== existing.tlsNumber) {
    const duplicate = await prisma.sgaItem.findUnique({ where: { tlsNumber: normalizedTls } });
    if (duplicate) {
      throw new Error("Nomor TLS sudah terdata. Silakan gunakan Nomor TLS lain.");
    }
  }
  const branchInfo = parsed.branchId ? await resolveActiveBranchForWrite(user, parsed.branchId) : null;

  const updated = await prisma.sgaItem.update({
    where: { id },
    data: {
      tlsNumber: normalizedTls,
      branch: branchInfo ? { connect: { id: branchInfo.branchId } } : undefined,
      inputDate: parsed.inputDate === undefined ? undefined : toDate(parsed.inputDate) || undefined,
      itemName: parsed.itemName,
      quantity: parsed.quantity,
      picName: parsed.picName,
      eligibilityStatus: parsed.eligibilityStatus,
      note: parsed.note === undefined ? undefined : parsed.note || null
    },
    include: sgaInclude
  });

  revalidatePath("/");
  return toSgaItemDTO(updated);
}

export async function deleteSgaItem(id: string) {
  const user = await getActor();
  assertSgaAccess(user);
  if (!canDeleteOperationalData(user)) {
    throw new Error("Role Anda tidak dapat menghapus data SGA.");
  }
  await assertCanAccessSgaItem(user, id);
  const existingOrder = await prisma.sgaSaleOrder.findFirst({
    where: {
      sgaItemId: id,
      status: { in: ["APPROVAL", "TERJUAL"] }
    }
  });
  if (existingOrder) {
    throw new Error("Data SGA sudah memiliki transaksi dan tidak dapat dihapus.");
  }

  await prisma.sgaItem.delete({ where: { id } });

  revalidatePath("/");
  return { id };
}

export async function exportSgaCsv(filters?: SgaFilters) {
  const user = await getActor();
  if (!canExportData(user)) {
    throw new Error("Role Anda tidak dapat melakukan export data.");
  }
  assertSgaAccess(user);
  const items = await listSgaItems(filters, user);
  return buildSgaCsv(items);
}

export async function createSaleOrder(data: SaleOrderInput) {
  const user = await getActor();
  if (!canCreateOrder(user)) {
    throw new Error("Role cabang tidak dapat membuat order jual.");
  }
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

  const existingOrder = await getSparepartActiveSaleOrder(parsed.sparepartId);

  if (existingOrder?.status === "APPROVAL") {
    throw new Error("Sparepart sudah dalam order.");
  }

  if (existingOrder?.status === "TERJUAL") {
    throw new Error("Sparepart sudah terjual.");
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

export async function createUsedGoodsSaleOrder(data: UsedGoodsSaleOrderInput) {
  const user = await getActor();
  if (!canCreateOrder(user)) {
    throw new Error("Role cabang tidak dapat membuat order jual.");
  }
  const parsed = usedGoodsSaleOrderInputSchema.parse(data);
  const item = await prisma.usedGoods.findUnique({
    where: { id: parsed.usedGoodsId },
    include: usedGoodsInclude
  });

  if (!item) {
    throw new Error("Barang bekas tidak ditemukan.");
  }

  if (item.condition !== "LAYAK_JUAL") {
    throw new Error("Order jual hanya dapat dibuat untuk barang bekas LAYAK JUAL.");
  }

  const existingOrders = await getUsedGoodsActiveSaleOrders(parsed.usedGoodsId);
  const saleIndex = buildUsedGoodsSaleIndex(
    existingOrders.map((order) => ({
      usedGoodsId: parsed.usedGoodsId,
      qty: Number(order.qty),
      status: order.status
    }))
  );
  const availability = getUsedGoodsSaleAvailability({ id: parsed.usedGoodsId, qty: Number(item.qty) }, saleIndex);

  if (availability.qtyDalamOrder > 0) {
    throw new Error("Barang bekas sedang dalam order.");
  }

  if (parsed.qty > availability.qtyTersedia) {
    throw new Error("Qty dijual tidak boleh melebihi qty tersedia.");
  }

  const created = await prisma.usedGoodsSaleOrder.create({
    data: {
      usedGoodsId: parsed.usedGoodsId,
      qty: parsed.qty,
      buyerName: parsed.buyerName,
      price: parsed.price,
      saleDate: toDate(parsed.saleDate) || new Date(),
      status: "APPROVAL",
      notes: parsed.notes || null
    },
    include: usedGoodsSaleOrderInclude
  });

  revalidatePath("/");
  return toUsedGoodsSaleOrderDTO(created);
}

export async function updateSaleOrderStatus(id: string, status: unknown) {
  const user = await getActor();
  if (!canCreateOrder(user)) {
    throw new Error("Role cabang tidak dapat mengubah order jual.");
  }
  const parsed = saleStatusSchema.parse(status);
  const updated = await prisma.saleOrder.update({
    where: { id },
    data: { status: parsed },
    include: saleOrderInclude
  });

  revalidatePath("/");
  return toSaleOrderDTO(updated);
}

export async function updateUsedGoodsSaleOrderStatus(id: string, status: unknown) {
  const user = await getActor();
  if (!canCreateOrder(user)) {
    throw new Error("Role cabang tidak dapat mengubah order jual.");
  }
  const parsed = saleStatusSchema.parse(status);
  const updated = await prisma.usedGoodsSaleOrder.update({
    where: { id },
    data: { status: parsed },
    include: usedGoodsSaleOrderInclude
  });

  revalidatePath("/");
  return toUsedGoodsSaleOrderDTO(updated);
}

export async function createSgaSaleOrder(data: SgaSaleOrderInput) {
  const user = await getActor();
  assertSgaCentralAccess(user);
  const parsed = sgaSaleOrderInputSchema.parse(data);
  const item = await prisma.sgaItem.findUnique({
    where: { id: parsed.sgaItemId },
    include: sgaInclude
  });

  if (!item) {
    throw new Error("Data SGA tidak ditemukan.");
  }
  if (item.eligibilityStatus !== "LAYAK_JUAL") {
    throw new Error("Order jual hanya dapat dibuat untuk SGA LAYAK JUAL.");
  }
  if (item.transactionStatus === "DALAM_ORDER") {
    throw new Error("SGA sudah dalam order.");
  }
  if (item.transactionStatus === "TERJUAL") {
    throw new Error("SGA sudah terjual.");
  }

  const created = await prisma.$transaction(async (tx) => {
    const order = await tx.sgaSaleOrder.create({
      data: {
        sgaItemId: parsed.sgaItemId,
        buyerName: parsed.buyerName,
        buyerType: parsed.buyerType || null,
        salePrice: parsed.salePrice,
        saleDate: toDate(parsed.saleDate) || new Date(),
        status: "APPROVAL",
        note: parsed.note || null,
        createdById: user.id
      },
      include: sgaSaleOrderInclude
    });
    await tx.sgaItem.update({
      where: { id: parsed.sgaItemId },
      data: { transactionStatus: "DALAM_ORDER" }
    });
    return order;
  });

  revalidatePath("/");
  return toSgaSaleOrderDTO(created);
}

export async function updateSgaSaleOrderStatus(id: string, status: unknown) {
  const user = await getActor();
  assertSgaCentralAccess(user);
  const parsed = saleStatusSchema.parse(status);

  const updated = await prisma.$transaction(async (tx) => {
    const order = await tx.sgaSaleOrder.update({
      where: { id },
      data: { status: parsed },
      include: sgaSaleOrderInclude
    });
    await tx.sgaItem.update({
      where: { id: order.sgaItemId },
      data: {
        transactionStatus: parsed === "TERJUAL" ? "TERJUAL" : parsed === "APPROVAL" ? "DALAM_ORDER" : "TERSEDIA"
      }
    });
    return order;
  });

  revalidatePath("/");
  return toSgaSaleOrderDTO(updated);
}

export async function createBranch(data: BranchInput) {
  const user = await getActor();
  if (!canManageBranches(user)) {
    throw new Error("Role Anda tidak dapat mengelola cabang.");
  }

  const parsed = branchInputSchema.parse(data);
  const created = await prisma.branch.create({
    data: parsed
  });

  revalidatePath("/");
  return toBranchDTO(created);
}

export async function updateBranch(id: string, data: BranchUpdateInput) {
  const user = await getActor();
  if (!canManageBranches(user)) {
    throw new Error("Role Anda tidak dapat mengelola cabang.");
  }

  const parsed = branchUpdateSchema.parse({ ...data, id });
  const updated = await prisma.branch.update({
    where: { id },
    data: {
      code: parsed.code,
      name: parsed.name,
      regional: parsed.regional,
      city: parsed.city,
      address: parsed.address,
      phone: parsed.phone,
      isActive: parsed.isActive
    }
  });

  revalidatePath("/");
  return toBranchDTO(updated);
}

async function validateUserBranch(role: string, branchId: string | null | undefined) {
  if (role === "ADMIN_CABANG" || role === "KARYAWAN_CABANG") {
    if (!branchId) throw new Error("User cabang wajib memiliki cabang.");
    const branch = await prisma.branch.findFirst({ where: { id: branchId, isActive: true } });
    if (!branch) throw new Error("Cabang user tidak ditemukan atau nonaktif.");
  }
}

export async function createUser(data: UserCreateInput) {
  const actor = await getActor();
  if (!canManageUsers(actor)) {
    throw new Error("Role Anda tidak dapat mengelola user.");
  }

  const parsed = userCreateSchema.parse(data);
  if (!canAssignRole(actor, parsed.role)) {
    throw new Error("Role ini tidak dapat dibuat dari UI v4.");
  }
  await validateUserBranch(parsed.role, parsed.branchId);

  const created = await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      passwordHash: hashPassword(parsed.password),
      role: parsed.role,
      branchId: parsed.branchId || null,
      isActive: parsed.isActive
    },
    include: { branch: true }
  });

  revalidatePath("/");
  return toUserDTO(created);
}

export async function updateUser(id: string, data: UserUpdateInput) {
  const actor = await getActor();
  if (!canManageUsers(actor)) {
    throw new Error("Role Anda tidak dapat mengelola user.");
  }

  const target = await prisma.user.findUnique({ where: { id }, include: { branch: true } });
  if (!target || !canManageTargetUser(actor, target)) {
    throw new Error("User tidak ditemukan atau tidak dapat dikelola.");
  }

  const parsed = userUpdateSchema.parse({ ...data, id });
  const nextRole = parsed.role || target.role;
  if (!canAssignRole(actor, nextRole)) {
    throw new Error("Role ini tidak dapat diberikan dari UI v4.");
  }
  await validateUserBranch(nextRole, parsed.branchId ?? target.branchId);

  const updated = await prisma.user.update({
    where: { id },
    data: {
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
      branchId: parsed.branchId === undefined ? undefined : parsed.branchId || null,
      isActive: parsed.isActive
    },
    include: { branch: true }
  });

  revalidatePath("/");
  return toUserDTO(updated);
}

export async function resetUserPassword(data: PasswordResetInput) {
  const actor = await getActor();
  if (!canManageUsers(actor)) {
    throw new Error("Role Anda tidak dapat mengelola user.");
  }

  const parsed = passwordResetSchema.parse(data);
  const target = await prisma.user.findUnique({ where: { id: parsed.id }, include: { branch: true } });
  if (!target || !canManageTargetUser(actor, target)) {
    throw new Error("User tidak ditemukan atau tidak dapat dikelola.");
  }

  const updated = await prisma.user.update({
    where: { id: parsed.id },
    data: {
      passwordHash: hashPassword(parsed.password)
    },
    include: { branch: true }
  });

  revalidatePath("/");
  return toUserDTO(updated);
}
