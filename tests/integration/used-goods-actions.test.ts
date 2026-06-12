import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, revalidatePathMock, noStoreMock } = vi.hoisted(() => ({
  prismaMock: {
    branch: {
      findUnique: vi.fn(),
      findFirst: vi.fn()
    },
    usedGoods: {
      count: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn()
    },
    usedGoodsSaleOrder: {
      findMany: vi.fn()
    }
  },
  revalidatePathMock: vi.fn(),
  noStoreMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
  unstable_noStore: noStoreMock
}));

vi.mock("@/lib/auth", () => ({
  requireActionUser: vi.fn(() => ({
    id: "user-admin-pusat",
    name: "Admin Pusat",
    email: "adminpusat@barkas.local",
    role: "ADMIN_PUSAT",
    branchId: null
  }))
}));

import { createUsedGoods, deleteUsedGoods, exportUsedGoodsCsv, getUsedGoodsStats, listUsedGoods } from "@/app/actions";

const branch = {
  id: "branch-sirclo",
  name: "Sirclo",
  code: "SIRCLO"
};

function makeRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "bb-kardus",
    code: "BB-20260521-0001",
    branchId: "branch-sirclo",
    inputDate: new Date("2026-05-21T00:00:00.000Z"),
    name: "Kardus Bekas",
    category: "KARDUS_KARTON",
    qty: 270,
    unit: "PCS",
    estimatedWeightKg: null,
    estimatedPrice: 0,
    condition: "LAYAK_JUAL",
    storageLocation: "GW Sirclo",
    pic: "Vincent",
    notes: "",
    createdAt: new Date("2026-05-21T00:00:00.000Z"),
    updatedAt: new Date("2026-05-21T00:00:00.000Z"),
    branch,
    ...overrides
  } as any;
}

describe("used goods server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.branch.findUnique.mockResolvedValue(branch);
    prismaMock.branch.findFirst.mockResolvedValue(branch);
    prismaMock.usedGoods.findUnique.mockResolvedValue(makeRecord());
    prismaMock.usedGoodsSaleOrder.findMany.mockResolvedValue([]);
  });

  it("creates used goods with valid data and generated code", async () => {
    prismaMock.usedGoods.count.mockResolvedValue(0);
    prismaMock.usedGoods.create.mockResolvedValue(
      makeRecord({
        code: "BB-20260522-0001",
        inputDate: new Date("2026-05-22T00:00:00.000Z"),
        name: "Kardus Baru",
        qty: 12
      })
    );

    const created = await createUsedGoods({
      branchId: "branch-sirclo",
      inputDate: "2026-05-22",
      name: "Kardus Baru",
      category: "KARDUS_KARTON",
      qty: 12,
      unit: "PCS",
      estimatedWeightKg: null,
      estimatedPrice: null,
      condition: "LAYAK_JUAL",
      storageLocation: "GW Sirclo",
      pic: "Vincent",
      notes: ""
    });

    expect(prismaMock.usedGoods.count).toHaveBeenCalledWith({
      where: { code: { startsWith: "BB-20260522" } }
    });
    expect(prismaMock.usedGoods.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          code: "BB-20260522-0001",
          branchId: "branch-sirclo",
          name: "Kardus Baru",
          qty: 12,
          condition: "LAYAK_JUAL"
        })
      })
    );
    expect(created.code).toBe("BB-20260522-0001");
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
  });

  it("rejects invalid create data before touching the database", async () => {
    await expect(
      createUsedGoods({
        branchId: "branch-sirclo",
        inputDate: "2026-05-22",
        name: "",
        category: "KARDUS_KARTON",
        qty: 0,
        unit: "PCS",
        estimatedWeightKg: null,
        estimatedPrice: null,
        condition: "LAYAK_JUAL",
        storageLocation: "",
        pic: "",
        notes: ""
      })
    ).rejects.toThrow();

    expect(prismaMock.branch.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.usedGoods.create).not.toHaveBeenCalled();
  });

  it("deletes the selected used goods row", async () => {
    prismaMock.usedGoods.delete.mockResolvedValue(makeRecord());

    await expect(deleteUsedGoods("bb-kardus")).resolves.toEqual({ id: "bb-kardus" });

    expect(prismaMock.usedGoods.delete).toHaveBeenCalledWith({ where: { id: "bb-kardus" } });
    expect(revalidatePathMock).toHaveBeenCalledWith("/");
  });

  it("lists used goods with condition, category, branch, and text filters", async () => {
    prismaMock.usedGoods.findMany.mockResolvedValue([makeRecord()]);

    await listUsedGoods({
      condition: "LAYAK_JUAL",
      category: "KARDUS_KARTON",
      branchId: "branch-sirclo",
      query: "Sirclo"
    });

    expect(prismaMock.usedGoods.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          condition: "LAYAK_JUAL",
          category: "KARDUS_KARTON",
          branchId: "branch-sirclo",
          OR: expect.arrayContaining([
            { code: { contains: "Sirclo", mode: "insensitive" } },
            { name: { contains: "Sirclo", mode: "insensitive" } },
            { branch: { is: { name: { contains: "Sirclo", mode: "insensitive" } } } }
          ])
        })
      })
    );
  });

  it("searches used goods by category label", async () => {
    prismaMock.usedGoods.findMany.mockResolvedValue([makeRecord()]);

    await listUsedGoods({ query: "Kardus" });

    expect(prismaMock.usedGoods.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([{ category: { in: ["KARDUS_KARTON"] } }])
        })
      })
    );
  });

  it("calculates used goods stats", async () => {
    prismaMock.usedGoods.findMany.mockResolvedValueOnce([
      { branchId: "branch-sirclo", qty: 270, estimatedWeightKg: null, condition: "LAYAK_JUAL" },
      { branchId: "branch-cargo", qty: 5, estimatedWeightKg: 5, condition: "LAYAK_JUAL" },
      { branchId: "branch-sirclo", qty: 2, estimatedWeightKg: 1, condition: "TIDAK_LAYAK" }
    ]);

    await expect(getUsedGoodsStats()).resolves.toEqual({
      total: 3,
      totalQty: 277,
      saleable: 2,
      notSaleable: 1,
      totalWeightKg: 6,
      activeBranches: 2
    });
    expect(prismaMock.usedGoods.count).not.toHaveBeenCalled();
    expect(prismaMock.usedGoods.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: {
          branchId: true,
          qty: true,
          estimatedWeightKg: true,
          condition: true
        }
      })
    );
  });

  it("exports used goods CSV with the required header", async () => {
    prismaMock.usedGoods.findMany.mockResolvedValue([makeRecord()]);

    const csv = await exportUsedGoodsCsv();

    expect(csv.split("\n")[0]).toBe(
      '"No","Kode Barang","Cabang","Tanggal Input","Nama Barang","Kategori","Qty","Satuan","Estimasi Berat Kg","Estimasi Harga Jual","Kondisi","Lokasi Penyimpanan","PIC","Keterangan"'
    );
  });
});
