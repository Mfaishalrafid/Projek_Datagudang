import { describe, expect, it } from "vitest";
import {
  applyBranchScope,
  canAccessCentralDashboard,
  canAccessSales,
  canAssignRole,
  canDeleteOperationalData,
  getSidebarMenu,
  resolveWriteBranchId,
  type SessionUser
} from "@/lib/access-control";

const adminPusat: SessionUser = {
  id: "u1",
  name: "Admin Pusat",
  email: "admin@barkas.local",
  role: "ADMIN_PUSAT",
  branchId: null
};

const adminCabang: SessionUser = {
  id: "u2",
  name: "Admin Cabang",
  email: "cabang@barkas.local",
  role: "ADMIN_CABANG",
  branchId: "branch-a"
};

const karyawan: SessionUser = {
  ...adminCabang,
  id: "u3",
  role: "KARYAWAN_CABANG"
};

describe("role permission helpers", () => {
  it("allows dashboard pusat and layak jual only for central roles", () => {
    expect(canAccessCentralDashboard(adminPusat)).toBe(true);
    expect(canAccessSales(adminPusat)).toBe(true);
    expect(canAccessCentralDashboard(adminCabang)).toBe(false);
    expect(canAccessSales(adminCabang)).toBe(false);
  });

  it("keeps delete permission away from karyawan cabang", () => {
    expect(canDeleteOperationalData(adminPusat)).toBe(true);
    expect(canDeleteOperationalData(adminCabang)).toBe(true);
    expect(canDeleteOperationalData(karyawan)).toBe(false);
  });

  it("applies branch scope and ignores client branch for cabang users", () => {
    expect(applyBranchScope(adminCabang, { condition: "LAYAK_JUAL" })).toEqual({
      condition: "LAYAK_JUAL",
      branchId: "branch-a"
    });
    expect(resolveWriteBranchId(adminCabang, "branch-other")).toBe("branch-a");
    expect(resolveWriteBranchId(adminPusat, "branch-other")).toBe("branch-other");
  });

  it("blocks assigning SUPER_ADMIN through UI v4", () => {
    expect(canAssignRole({ role: "SUPER_ADMIN" }, "SUPER_ADMIN")).toBe(false);
    expect(canAssignRole(adminPusat, "SUPER_ADMIN")).toBe(false);
    expect(canAssignRole(adminPusat, "ADMIN_CABANG")).toBe(true);
  });

  it("builds role-based sidebar menus", () => {
    const centralMenu = getSidebarMenu(adminPusat);
    expect(centralMenu.map((item) => item.key)).toContain("penjualan");
    expect(centralMenu.map((item) => item.key)).toContain("users");
    expect(centralMenu.find((item) => item.key === "barangbekas")?.section).toBe("main");
    expect(centralMenu.some((item) => item.section === "usedGoods")).toBe(false);
    expect(getSidebarMenu(adminCabang).map((item) => item.key)).not.toContain("penjualan");
    expect(getSidebarMenu(karyawan).map((item) => item.label)).toContain("Dashboard Cabang");
  });
});
