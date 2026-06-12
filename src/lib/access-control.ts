import type { Prisma, Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  branchId: string | null;
  branchName?: string | null;
  branchCode?: string | null;
};

export type SidebarMenuItem = {
  key: string;
  label: string;
  section: "main" | "usedGoods" | "reference" | "management" | "tools";
};

const centralRoles: Role[] = ["SUPER_ADMIN", "ADMIN_PUSAT"];
const branchRoles: Role[] = ["ADMIN_CABANG", "KARYAWAN_CABANG"];

export function isCentralRole(role: Role) {
  return centralRoles.includes(role);
}

export function isBranchRole(role: Role) {
  return branchRoles.includes(role);
}

export function canAccessCentralDashboard(user: Pick<SessionUser, "role">) {
  return isCentralRole(user.role);
}

export function canAccessSales(user: Pick<SessionUser, "role">) {
  return isCentralRole(user.role);
}

export function canManageBranches(user: Pick<SessionUser, "role">) {
  return isCentralRole(user.role);
}

export function canManageUsers(user: Pick<SessionUser, "role">) {
  return isCentralRole(user.role);
}

export function canDeleteOperationalData(user: Pick<SessionUser, "role">) {
  return user.role === "SUPER_ADMIN" || user.role === "ADMIN_PUSAT" || user.role === "ADMIN_CABANG";
}

export function canExportData(user: Pick<SessionUser, "role">) {
  return user.role !== "KARYAWAN_CABANG";
}

export function canCreateOrder(user: Pick<SessionUser, "role">) {
  return canAccessSales(user);
}

export function canAccessSga(user: Pick<SessionUser, "role">) {
  return isCentralRole(user.role) || isBranchRole(user.role);
}

export function assertBranchUserHasBranch(user: Pick<SessionUser, "role" | "branchId">) {
  if (isBranchRole(user.role) && !user.branchId) {
    throw new Error("User cabang tidak memiliki branchId.");
  }
}

export function applyBranchScope<T extends Prisma.SparepartWhereInput | Prisma.UsedGoodsWhereInput | Prisma.SgaItemWhereInput>(
  user: Pick<SessionUser, "role" | "branchId">,
  where: T
): T {
  if (!isBranchRole(user.role)) return where;
  assertBranchUserHasBranch(user);

  return {
    ...where,
    branchId: user.branchId
  } as T;
}

export function resolveWriteBranchId(user: Pick<SessionUser, "role" | "branchId">, requestedBranchId?: string | null) {
  if (isBranchRole(user.role)) {
    assertBranchUserHasBranch(user);
    return user.branchId as string;
  }

  if (!requestedBranchId) {
    throw new Error("Cabang wajib dipilih.");
  }

  return requestedBranchId;
}

export function canAssignRole(actor: Pick<SessionUser, "role">, targetRole: Role) {
  if (targetRole === "SUPER_ADMIN") return false;
  if (actor.role === "SUPER_ADMIN") return true;
  if (actor.role === "ADMIN_PUSAT") return true;
  return false;
}

export function canManageTargetUser(actor: Pick<SessionUser, "role">, target: Pick<SessionUser, "role" | "branchId">) {
  if (actor.role === "SUPER_ADMIN") return true;
  if (actor.role === "ADMIN_PUSAT") return target.role !== "SUPER_ADMIN";
  return false;
}

export function getSidebarMenu(user: Pick<SessionUser, "role">): SidebarMenuItem[] {
  if (isCentralRole(user.role)) {
    return [
      { key: "dashboard", label: "Dashboard Pusat", section: "main" },
      { key: "pendataan", label: "Pendataan Sparepart", section: "main" },
      { key: "barangbekas", label: "Pendataan Barang Bekas", section: "main" },
      { key: "sga", label: "Pendataan SGA", section: "main" },
      { key: "inventori", label: "Inventori Semua Cabang", section: "main" },
      { key: "penjualan", label: "Layak Jual", section: "main" },
      { key: "cabang", label: "Data per Cabang", section: "reference" },
      { key: "branches", label: "Manajemen Cabang", section: "management" },
      { key: "users", label: "Manajemen User", section: "management" },
      { key: "laporan", label: "Laporan", section: "reference" }
    ];
  }

  return [
    { key: "dashboard", label: "Dashboard Cabang", section: "main" },
    { key: "pendataan", label: "Pendataan Sparepart", section: "main" },
    { key: "barangbekas", label: "Pendataan Barang Bekas", section: "main" },
    { key: "sga", label: "Pendataan SGA", section: "main" },
    { key: "inventori", label: "Inventori Cabang", section: "main" },
    { key: "laporan", label: "Laporan Cabang", section: "reference" },
    { key: "cabang", label: "Profil Cabang", section: "reference" }
  ];
}
