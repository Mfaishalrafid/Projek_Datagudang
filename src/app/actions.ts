"use server";

import { prisma } from "@/lib/prisma";
import { toBranchDTO, toSaleOrderDTO, toSparepartDTO, toUsedGoodsDTO, toUsedGoodsSaleOrderDTO, toUserDTO } from "@/lib/mappers";
import type { DashboardStats, InitialData, UsedGoodsStats } from "@/lib/types";
import {
  branchInputSchema,
  branchUpdateSchema,
  loginSchema,
  passwordResetSchema,
  saleOrderInputSchema,
  saleStatusSchema,
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
import { usedGoodsCategoryLabels, vehicleTypeByCode } from "@/data/options";
import { buildUsedGoodsCsv } from "@/lib/csv";
import { clearSessionCookie, requireActionUser, setSessionCookie, toSessionUser } from "@/lib/auth";
import {
  applyBranchScope,
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
import { hashPassword, verifyPassword } from "@/lib/password";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
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

const usedGoodsSaleOrderInclude = {
  usedGoods: {
    include: {
      branch: true
    }
  }
} satisfies Prisma.UsedGoodsSaleOrderInclude;

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

export async function getUsedGoodsStats(actor?: SessionUser): Promise<UsedGoodsStats> {
  noStore();
  const user = await getActor(actor);
  const where = applyBranchScope(user, {} satisfies Prisma.UsedGoodsWhereInput);
  const [total, saleable, notSaleable, items, branches] = await Promise.all([
    prisma.usedGoods.count({ where }),
    prisma.usedGoods.count({ where: { ...where, condition: "LAYAK_JUAL" } }),
    prisma.usedGoods.count({ where: { ...where, condition: "TIDAK_LAYAK" } }),
    prisma.usedGoods.findMany({
      where,
      select: {
        qty: true,
        estimatedWeightKg: true
      }
    }),
    prisma.usedGoods.findMany({
      where,
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

export async function getDashboardStats(actor?: SessionUser): Promise<DashboardStats> {
  noStore();
  const user = await getActor(actor);
  const where = applyBranchScope(user, {} satisfies Prisma.SparepartWhereInput);
  const [total, saleable, damaged, activeBranches, plates, pjpps, usedGoods] = await Promise.all([
    prisma.sparepart.count({ where }),
    prisma.sparepart.count({ where: { ...where, condition: "LAYAK_JUAL" } }),
    prisma.sparepart.count({ where: { ...where, condition: "RUSAK" } }),
    prisma.sparepart.findMany({
      where,
      distinct: ["branchId"],
      select: { branchId: true }
    }),
    prisma.sparepart.findMany({
      where,
      distinct: ["plateNumber"],
      select: { plateNumber: true }
    }),
    prisma.sparepart.findMany({
      where,
      distinct: ["pjpp"],
      select: { pjpp: true }
    }),
    getUsedGoodsStats(user)
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
  const [branches, spareparts, saleOrders, usedGoodsSaleOrders, usedGoods, users, stats] = await Promise.all([
    listBranches(user),
    listSpareparts(undefined, user),
    listSaleOrders(user),
    listUsedGoodsSaleOrders(user),
    listUsedGoods(undefined, user),
    listUsers(user),
    getDashboardStats(user)
  ]);

  return {
    currentUser: user,
    branches,
    spareparts,
    saleOrders,
    usedGoodsSaleOrders,
    usedGoods,
    users,
    stats
  } satisfies InitialData;
}

export async function getUsedGoodsReportData(actor?: SessionUser) {
  noStore();
  const user = await getActor(actor);
  const [items, stats] = await Promise.all([listUsedGoods(undefined, user), getUsedGoodsStats(user)]);
  return { items, stats };
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
  const qtyDalamOrder = existingOrders
    .filter((order) => order.status === "APPROVAL")
    .reduce((sum, order) => sum + Number(order.qty), 0);
  const qtyTerjual = existingOrders
    .filter((order) => order.status === "TERJUAL")
    .reduce((sum, order) => sum + Number(order.qty), 0);
  const qtyTersedia = Math.max(0, Number(item.qty) - qtyDalamOrder - qtyTerjual);

  if (qtyDalamOrder > 0) {
    throw new Error("Barang bekas sedang dalam order.");
  }

  if (parsed.qty > qtyTersedia) {
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
