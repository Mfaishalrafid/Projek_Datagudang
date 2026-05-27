import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, actorRef, revalidatePathMock, noStoreMock } = vi.hoisted(() => ({
  actorRef: {
    current: {
      id: "user-admin-pusat",
      name: "Admin Pusat",
      email: "adminpusat@barkas.local",
      role: "ADMIN_PUSAT",
      branchId: null
    } as any
  },
  prismaMock: {
    branch: {
      findMany: vi.fn(),
      findFirst: vi.fn()
    },
    sparepart: {
      count: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn()
    },
    usedGoods: {
      delete: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn()
    },
    saleOrder: {
      create: vi.fn(),
      findFirst: vi.fn()
    },
    usedGoodsSaleOrder: {
      create: vi.fn(),
      findMany: vi.fn()
    }
  },
  revalidatePathMock: vi.fn(),
  noStoreMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock
}));

vi.mock("@/lib/auth", () => ({
  requireActionUser: vi.fn(() => actorRef.current)
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
  unstable_noStore: noStoreMock
}));

import { createSaleOrder, createSparepart, createUsedGoodsSaleOrder, deleteSparepart, deleteUsedGoods, listSpareparts, updateSparepart, updateUsedGoods, updateUser } from "@/app/actions";

const branch = {
  id: "branch-a",
  name: "IGR CIPUTAT",
  code: "IGR-CPT",
  regional: "Jabodetabek",
  city: "Ciputat",
  address: null,
  phone: null,
  isActive: true,
  createdAt: new Date("2026-05-21T00:00:00.000Z"),
  updatedAt: new Date("2026-05-21T00:00:00.000Z")
};

function makeSparepart(overrides: Record<string, unknown> = {}) {
  return {
    id: "part-a",
    pjpp: "PJPP-1",
    branchId: "branch-a",
    removedDate: new Date("2026-05-21T00:00:00.000Z"),
    name: "BAN LUAR",
    category: "BAN",
    plateNumber: "B 1234 AA",
    vehicleCode: "CDE",
    vehicleType: "ENGKEL",
    condition: "LAYAK_JUAL",
    storageLocation: "IGR CIPUTAT",
    notes: null,
    createdAt: new Date("2026-05-21T00:00:00.000Z"),
    updatedAt: new Date("2026-05-21T00:00:00.000Z"),
    branch,
    ...overrides
  } as any;
}

function makeUsedGoods(overrides: Record<string, unknown> = {}) {
  return {
    id: "bb-a",
    code: "BB-20260521-0001",
    branchId: "branch-a",
    inputDate: new Date("2026-05-21T00:00:00.000Z"),
    name: "Kardus Bekas",
    category: "KARDUS_KARTON",
    qty: 5,
    unit: "PCS",
    estimatedWeightKg: 1,
    estimatedPrice: 25000,
    condition: "LAYAK_JUAL",
    storageLocation: "Gudang",
    pic: "PIC",
    notes: null,
    createdAt: new Date("2026-05-21T00:00:00.000Z"),
    updatedAt: new Date("2026-05-21T00:00:00.000Z"),
    branch,
    ...overrides
  } as any;
}

describe("v4 branch scope server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actorRef.current = {
      id: "user-admin-pusat",
      name: "Admin Pusat",
      email: "adminpusat@barkas.local",
      role: "ADMIN_PUSAT",
      branchId: null
    } as any;
    prismaMock.branch.findFirst.mockResolvedValue(branch);
    prismaMock.sparepart.create.mockResolvedValue(makeSparepart());
    prismaMock.sparepart.findMany.mockResolvedValue([makeSparepart()]);
    prismaMock.sparepart.findUnique.mockResolvedValue(makeSparepart());
    prismaMock.sparepart.update.mockResolvedValue(makeSparepart({ name: "BAN EDIT" }));
    prismaMock.usedGoods.findUnique.mockResolvedValue(makeUsedGoods());
    prismaMock.usedGoods.update.mockResolvedValue(makeUsedGoods({ name: "Kardus Edit" }));
    prismaMock.saleOrder.findFirst.mockResolvedValue(null);
    prismaMock.usedGoodsSaleOrder.findMany.mockResolvedValue([]);
  });

  it("allows pusat roles to list all spareparts", async () => {
    await listSpareparts();

    expect(prismaMock.sparepart.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {}
      })
    );
  });

  it("forces branch scope for cabang roles", async () => {
    actorRef.current = {
      id: "user-cabang",
      name: "Admin Cabang",
      email: "cabang@barkas.local",
      role: "ADMIN_CABANG",
      branchId: "branch-a"
    } as any;

    await listSpareparts({ branchId: "branch-other" });

    expect(prismaMock.sparepart.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ branchId: "branch-a" })
      })
    );
  });

  it("ignores manipulated branchId when cabang creates sparepart", async () => {
    actorRef.current = {
      id: "user-cabang",
      name: "Admin Cabang",
      email: "cabang@barkas.local",
      role: "ADMIN_CABANG",
      branchId: "branch-a"
    } as any;

    await createSparepart({
      pjpp: "PJPP-1",
      branchId: "branch-other",
      removedDate: "2026-05-21",
      name: "BAN LUAR",
      category: "BAN",
      plateNumber: "B 1234 AA",
      vehicleCode: "CDE",
      vehicleType: "ENGKEL",
      condition: "LAYAK_JUAL",
      storageLocation: "",
      notes: ""
    });

    expect(prismaMock.sparepart.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ branchId: "branch-a" })
      })
    );
  });

  it("blocks karyawan cabang from deleting data", async () => {
    actorRef.current = {
      id: "user-karyawan",
      name: "Karyawan",
      email: "karyawan@barkas.local",
      role: "KARYAWAN_CABANG",
      branchId: "branch-a"
    } as any;

    await expect(deleteUsedGoods("bb-a")).rejects.toThrow("tidak dapat menghapus");
    expect(prismaMock.usedGoods.delete).not.toHaveBeenCalled();
  });

  it("blocks cabang roles from creating sale orders", async () => {
    actorRef.current = {
      id: "user-cabang",
      name: "Admin Cabang",
      email: "cabang@barkas.local",
      role: "ADMIN_CABANG",
      branchId: "branch-a"
    } as any;

    await expect(
      createSaleOrder({
        sparepartId: "part-a",
        buyerName: "Pembeli",
        buyerType: "PELANGGAN_UMUM",
        price: 10000,
        saleDate: "2026-05-23",
        status: "APPROVAL"
      })
    ).rejects.toThrow("tidak dapat membuat order jual");
    expect(prismaMock.saleOrder.create).not.toHaveBeenCalled();
  });

  it("blocks duplicate sparepart sale orders while in order", async () => {
    prismaMock.sparepart.findUnique.mockResolvedValue(makeSparepart());
    prismaMock.saleOrder.findFirst.mockResolvedValue({
      id: "order-active",
      sparepartId: "part-a",
      status: "APPROVAL"
    });

    await expect(
      createSaleOrder({
        sparepartId: "part-a",
        buyerName: "Pembeli",
        buyerType: "PELANGGAN_UMUM",
        price: 10000,
        saleDate: "2026-05-23",
        status: "APPROVAL"
      })
    ).rejects.toThrow("sudah dalam order");
    expect(prismaMock.saleOrder.create).not.toHaveBeenCalled();
  });

  it("blocks duplicate sparepart sale orders after sold", async () => {
    prismaMock.sparepart.findUnique.mockResolvedValue(makeSparepart());
    prismaMock.saleOrder.findFirst.mockResolvedValue({
      id: "order-sold",
      sparepartId: "part-a",
      status: "TERJUAL"
    });

    await expect(
      createSaleOrder({
        sparepartId: "part-a",
        buyerName: "Pembeli",
        buyerType: "PELANGGAN_UMUM",
        price: 10000,
        saleDate: "2026-05-23",
        status: "APPROVAL"
      })
    ).rejects.toThrow("sudah terjual");
    expect(prismaMock.saleOrder.create).not.toHaveBeenCalled();
  });

  it("allows sparepart update before an order exists", async () => {
    prismaMock.sparepart.findUnique.mockResolvedValue(makeSparepart());
    prismaMock.saleOrder.findFirst.mockResolvedValue(null);

    await updateSparepart("part-a", {
      id: "part-a",
      pjpp: "PJPP-1",
      branchId: "branch-a",
      removedDate: "2026-05-21",
      name: "BAN EDIT",
      category: "BAN",
      plateNumber: "B 1234 AA",
      vehicleCode: "CDE",
      vehicleType: "ENGKEL",
      condition: "LAYAK_JUAL",
      storageLocation: "IGR CIPUTAT",
      notes: ""
    });

    expect(prismaMock.sparepart.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "part-a" }
      })
    );
  });

  it("blocks sparepart update while in order", async () => {
    prismaMock.sparepart.findUnique.mockResolvedValue(makeSparepart());
    prismaMock.saleOrder.findFirst.mockResolvedValue({
      id: "order-active",
      sparepartId: "part-a",
      status: "APPROVAL"
    });

    await expect(
      updateSparepart("part-a", {
        id: "part-a",
        condition: "RUSAK"
      })
    ).rejects.toThrow("sudah dalam order");
    expect(prismaMock.sparepart.update).not.toHaveBeenCalled();
  });

  it("blocks sold sparepart from being changed to damaged", async () => {
    prismaMock.sparepart.findUnique.mockResolvedValue(makeSparepart());
    prismaMock.saleOrder.findFirst.mockResolvedValue({
      id: "order-sold",
      sparepartId: "part-a",
      status: "TERJUAL"
    });

    await expect(
      updateSparepart("part-a", {
        id: "part-a",
        condition: "RUSAK"
      })
    ).rejects.toThrow("sudah terjual");
    expect(prismaMock.sparepart.update).not.toHaveBeenCalled();
  });

  it("blocks sparepart delete while in order", async () => {
    prismaMock.sparepart.findUnique.mockResolvedValue(makeSparepart());
    prismaMock.saleOrder.findFirst.mockResolvedValue({
      id: "order-active",
      sparepartId: "part-a",
      status: "APPROVAL"
    });

    await expect(deleteSparepart("part-a")).rejects.toThrow("sudah dalam order");
    expect(prismaMock.sparepart.delete).not.toHaveBeenCalled();
  });

  it("blocks cabang roles from creating used goods sale orders", async () => {
    actorRef.current = {
      id: "user-cabang",
      name: "Admin Cabang",
      email: "cabang@barkas.local",
      role: "ADMIN_CABANG",
      branchId: "branch-a"
    } as any;

    await expect(
      createUsedGoodsSaleOrder({
        usedGoodsId: "bb-a",
        qty: 1,
        buyerName: "Pembeli",
        price: 10000,
        saleDate: "2026-05-24",
        notes: ""
      })
    ).rejects.toThrow("tidak dapat membuat order jual");
    expect(prismaMock.usedGoodsSaleOrder.create).not.toHaveBeenCalled();
  });

  it("rejects used goods sale qty above available stock", async () => {
    prismaMock.usedGoods.findUnique.mockResolvedValue(makeUsedGoods({ qty: 5 }));
    prismaMock.usedGoodsSaleOrder.findMany.mockResolvedValue([
      { id: "sold", qty: 3, status: "TERJUAL" }
    ]);

    await expect(
      createUsedGoodsSaleOrder({
        usedGoodsId: "bb-a",
        qty: 3,
        buyerName: "Pembeli",
        price: 10000,
        saleDate: "2026-05-24",
        notes: ""
      })
    ).rejects.toThrow("melebihi qty tersedia");
    expect(prismaMock.usedGoodsSaleOrder.create).not.toHaveBeenCalled();
  });

  it("rejects used goods sale orders while another order is active", async () => {
    prismaMock.usedGoods.findUnique.mockResolvedValue(makeUsedGoods({ qty: 5 }));
    prismaMock.usedGoodsSaleOrder.findMany.mockResolvedValue([
      { id: "active", qty: 1, status: "APPROVAL" }
    ]);

    await expect(
      createUsedGoodsSaleOrder({
        usedGoodsId: "bb-a",
        qty: 1,
        buyerName: "Pembeli",
        price: 10000,
        saleDate: "2026-05-24",
        notes: ""
      })
    ).rejects.toThrow("sedang dalam order");
    expect(prismaMock.usedGoodsSaleOrder.create).not.toHaveBeenCalled();
  });

  it("allows used goods update before an order exists", async () => {
    prismaMock.usedGoods.findUnique.mockResolvedValue(makeUsedGoods());
    prismaMock.usedGoodsSaleOrder.findMany.mockResolvedValue([]);

    await updateUsedGoods("bb-a", {
      id: "bb-a",
      branchId: "branch-a",
      inputDate: "2026-05-21",
      name: "Kardus Edit",
      category: "KARDUS_KARTON",
      qty: 5,
      unit: "PCS",
      estimatedWeightKg: 1,
      estimatedPrice: 25000,
      condition: "LAYAK_JUAL",
      storageLocation: "Gudang",
      pic: "PIC",
      notes: ""
    });

    expect(prismaMock.usedGoods.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "bb-a" }
      })
    );
  });

  it("blocks protected used goods fields after a transaction exists", async () => {
    prismaMock.usedGoods.findUnique.mockResolvedValue(makeUsedGoods({ qty: 5 }));
    prismaMock.usedGoodsSaleOrder.findMany.mockResolvedValue([
      { id: "sold", qty: 1, status: "TERJUAL" }
    ]);

    await expect(
      updateUsedGoods("bb-a", {
        id: "bb-a",
        branchId: "branch-a",
        name: "Nama Baru",
        category: "PLASTIK",
        qty: 10,
        unit: "KG",
        condition: "TIDAK_LAYAK"
      })
    ).rejects.toThrow("sudah memiliki transaksi");
    expect(prismaMock.usedGoods.update).not.toHaveBeenCalled();
  });

  it("blocks admin pusat from updating SUPER_ADMIN", async () => {
    prismaMock.sparepart.findUnique.mockResolvedValue(null);
    (prismaMock as any).user = {
      findUnique: vi.fn().mockResolvedValue({
        id: "super",
        name: "Super",
        email: "super@barkas.local",
        role: "SUPER_ADMIN",
        branchId: null,
        isActive: true,
        createdAt: new Date("2026-05-21T00:00:00.000Z"),
        updatedAt: new Date("2026-05-21T00:00:00.000Z"),
        branch: null
      }),
      update: vi.fn()
    };

    await expect(updateUser("super", { id: "super", name: "Nope" })).rejects.toThrow("tidak dapat dikelola");
  });
});
