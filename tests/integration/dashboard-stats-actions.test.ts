import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, noStoreMock, actorRef } = vi.hoisted(() => {
  const prisma = {
    sparepart: {
      count: vi.fn(),
      findMany: vi.fn()
    },
    usedGoods: {
      count: vi.fn(),
      findMany: vi.fn()
    },
    sgaItem: {
      count: vi.fn(),
      findMany: vi.fn()
    }
  };

  return {
    prismaMock: prisma,
    noStoreMock: vi.fn(),
    actorRef: {
      current: {
        id: "user-admin-pusat",
        name: "Admin Pusat",
        email: "adminpusat@barkas.local",
        role: "ADMIN_PUSAT",
        branchId: null
      } as any
    }
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  unstable_noStore: noStoreMock
}));

vi.mock("@/lib/auth", () => ({
  requireActionUser: vi.fn(() => actorRef.current)
}));

import { getDashboardStats } from "@/app/actions";

describe("dashboard stats action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actorRef.current = {
      id: "user-admin-pusat",
      name: "Admin Pusat",
      email: "adminpusat@barkas.local",
      role: "ADMIN_PUSAT",
      branchId: null
    };
    prismaMock.sparepart.findMany.mockResolvedValue([
      { branchId: "branch-sirclo", plateNumber: "B 1000 ABC", pjpp: "PJPP-001", condition: "LAYAK_JUAL" },
      { branchId: "branch-cargo", plateNumber: "B 2000 ABC", pjpp: "PJPP-002", condition: "RUSAK" }
    ]);
    prismaMock.usedGoods.findMany.mockResolvedValue([
      { branchId: "branch-sirclo", qty: 3, estimatedWeightKg: 2, condition: "LAYAK_JUAL" }
    ]);
    prismaMock.sgaItem.findMany.mockResolvedValue([
      { branchId: "branch-cargo", quantity: 5, eligibilityStatus: "LAYAK_JUAL", transactionStatus: "DALAM_ORDER" }
    ]);
  });

  it("calculates dashboard stats from selected rows without count/distinct query fan-out", async () => {
    await expect(getDashboardStats()).resolves.toMatchObject({
      total: 2,
      saleable: 1,
      damaged: 1,
      activeBranches: 2,
      uniquePlates: 2,
      uniquePjpp: 2,
      usedGoods: {
        total: 1,
        totalQty: 3,
        saleable: 1,
        totalWeightKg: 2
      },
      sga: {
        total: 1,
        totalQuantity: 5,
        inOrder: 1
      }
    });
    expect(prismaMock.sparepart.count).not.toHaveBeenCalled();
    expect(prismaMock.usedGoods.count).not.toHaveBeenCalled();
    expect(prismaMock.sgaItem.count).not.toHaveBeenCalled();
  });

  it("keeps dashboard stats branch-scoped for cabang roles", async () => {
    actorRef.current = {
      id: "user-cabang",
      name: "Admin Cabang",
      email: "cabang@barkas.local",
      role: "ADMIN_CABANG",
      branchId: "branch-sirclo"
    };

    await getDashboardStats();

    expect(prismaMock.sparepart.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { branchId: "branch-sirclo" } }));
    expect(prismaMock.usedGoods.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { branchId: "branch-sirclo" } }));
    expect(prismaMock.sgaItem.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { branchId: "branch-sirclo" } }));
  });
});
