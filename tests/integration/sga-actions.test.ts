import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, revalidatePathMock, noStoreMock, actorRef } = vi.hoisted(() => {
  const centralUser = {
    id: "user-admin-pusat",
    name: "Admin Pusat",
    email: "adminpusat@barkas.local",
    role: "ADMIN_PUSAT",
    branchId: null
  };

  const prisma = {
    branch: {
      findFirst: vi.fn()
    },
    sgaItem: {
      count: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn()
    },
    sgaSaleOrder: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn()
    },
    $transaction: vi.fn(async (callback: any) =>
      callback({
        sgaItem: {
          update: prisma.sgaItem.update
        },
        sgaSaleOrder: {
          create: prisma.sgaSaleOrder.create,
          update: prisma.sgaSaleOrder.update
        }
      })
    )
  };

  return {
    prismaMock: prisma,
    revalidatePathMock: vi.fn(),
    noStoreMock: vi.fn(),
    actorRef: { current: centralUser as any }
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
  unstable_noStore: noStoreMock
}));

vi.mock("@/lib/auth", () => ({
  requireActionUser: vi.fn(() => actorRef.current)
}));

import {
  createSgaItem,
  createSgaSaleOrder,
  deleteSgaItem,
  exportSgaCsv,
  getSgaStats,
  listSaleableSgaItems,
  updateSgaItem
} from "@/app/actions";

const branch = {
  id: "branch-sirclo",
  name: "Sirclo",
  code: "SIRCLO"
};

const validPayload = {
  branchId: "branch-sirclo",
  inputDate: "2026-05-23",
  tlsNumber: " tls-2026-010 ",
  itemName: "Meja kantor bekas",
  quantity: 5,
  picName: "Ardi",
  eligibilityStatus: "LAYAK_JUAL" as const,
  note: ""
};

function makeSgaRecord(overrides: Record<string, unknown> = {}) {
  return {
    id: "sga-meja",
    tlsNumber: "TLS-2026-010",
    inputDate: new Date("2026-05-23T00:00:00.000Z"),
    branchId: "branch-sirclo",
    branch,
    itemName: "Meja kantor bekas",
    quantity: 5,
    picName: "Ardi",
    eligibilityStatus: "LAYAK_JUAL",
    transactionStatus: "TERSEDIA",
    note: null,
    createdById: "user-admin-pusat",
    createdAt: new Date("2026-05-23T00:00:00.000Z"),
    updatedAt: new Date("2026-05-23T00:00:00.000Z"),
    ...overrides
  } as any;
}

function makeSgaOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: "sga-order",
    sgaItemId: "sga-meja",
    sgaItem: makeSgaRecord(),
    buyerName: "Pembeli SGA",
    buyerType: null,
    salePrice: 250000,
    saleDate: new Date("2026-05-24T00:00:00.000Z"),
    status: "APPROVAL",
    note: null,
    createdById: "user-admin-pusat",
    createdAt: new Date("2026-05-24T00:00:00.000Z"),
    updatedAt: new Date("2026-05-24T00:00:00.000Z"),
    ...overrides
  } as any;
}

describe("SGA server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    actorRef.current = {
      id: "user-admin-pusat",
      name: "Admin Pusat",
      email: "adminpusat@barkas.local",
      role: "ADMIN_PUSAT",
      branchId: null
    };
    prismaMock.branch.findFirst.mockResolvedValue(branch);
    prismaMock.sgaItem.findUnique.mockResolvedValue(makeSgaRecord());
    prismaMock.sgaSaleOrder.findFirst.mockResolvedValue(null);
  });

  it("allows SUPER_ADMIN and ADMIN_PUSAT to create SGA with normalized unique TLS and default transaction status", async () => {
    prismaMock.sgaItem.findUnique.mockResolvedValue(null);
    prismaMock.sgaItem.create.mockResolvedValue(makeSgaRecord());

    const created = await createSgaItem(validPayload);

    expect(prismaMock.sgaItem.findUnique).toHaveBeenCalledWith({ where: { tlsNumber: "TLS-2026-010" } });
    expect(prismaMock.sgaItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tlsNumber: "TLS-2026-010",
          branchId: "branch-sirclo",
          transactionStatus: "TERSEDIA",
          createdById: "user-admin-pusat"
        })
      })
    );
    expect(created.transactionStatus).toBe("TERSEDIA");

    actorRef.current = {
      id: "user-super",
      name: "Super Admin",
      email: "super@barkas.local",
      role: "SUPER_ADMIN",
      branchId: null
    };
    prismaMock.sgaItem.findUnique.mockResolvedValue(null);
    prismaMock.sgaItem.create.mockResolvedValue(makeSgaRecord({ createdById: "user-super" }));

    await expect(createSgaItem(validPayload)).resolves.toMatchObject({ tlsNumber: "TLS-2026-010" });
  });

  it("rejects role cabang from creating SGA", async () => {
    actorRef.current = {
      id: "user-cabang",
      name: "Admin Cabang",
      email: "cabang@barkas.local",
      role: "ADMIN_CABANG",
      branchId: "branch-sirclo"
    };

    await expect(createSgaItem(validPayload)).rejects.toThrow("Role Anda tidak dapat mengakses SGA.");
    expect(prismaMock.sgaItem.create).not.toHaveBeenCalled();
  });

  it("rejects duplicate TLS after normalization", async () => {
    prismaMock.sgaItem.findUnique.mockResolvedValue(makeSgaRecord({ tlsNumber: "TLS-2026-010" }));

    await expect(createSgaItem(validPayload)).rejects.toThrow("Nomor TLS sudah terdata. Silakan gunakan Nomor TLS lain.");
    expect(prismaMock.sgaItem.create).not.toHaveBeenCalled();
  });

  it("lists only LAYAK_JUAL SGA for the saleable SGA tab", async () => {
    prismaMock.sgaItem.findMany.mockResolvedValue([makeSgaRecord()]);

    await listSaleableSgaItems();

    expect(prismaMock.sgaItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ eligibilityStatus: "LAYAK_JUAL" })
      })
    );
  });

  it("rejects selling TIDAK_LAYAK, DALAM_ORDER, or TERJUAL SGA", async () => {
    prismaMock.sgaItem.findUnique.mockResolvedValue(makeSgaRecord({ eligibilityStatus: "TIDAK_LAYAK" }));
    await expect(
      createSgaSaleOrder({ sgaItemId: "sga-meja", buyerName: "Pembeli", salePrice: 1, saleDate: "2026-05-24", buyerType: "", note: "" })
    ).rejects.toThrow("Order jual hanya dapat dibuat untuk SGA LAYAK JUAL.");

    prismaMock.sgaItem.findUnique.mockResolvedValue(makeSgaRecord({ transactionStatus: "DALAM_ORDER" }));
    await expect(
      createSgaSaleOrder({ sgaItemId: "sga-meja", buyerName: "Pembeli", salePrice: 1, saleDate: "2026-05-24", buyerType: "", note: "" })
    ).rejects.toThrow("SGA sudah dalam order.");

    prismaMock.sgaItem.findUnique.mockResolvedValue(makeSgaRecord({ transactionStatus: "TERJUAL" }));
    await expect(
      createSgaSaleOrder({ sgaItemId: "sga-meja", buyerName: "Pembeli", salePrice: 1, saleDate: "2026-05-24", buyerType: "", note: "" })
    ).rejects.toThrow("SGA sudah terjual.");
  });

  it("creates an SGA sale order and locks the item into DALAM_ORDER", async () => {
    prismaMock.sgaItem.findUnique.mockResolvedValue(makeSgaRecord());
    prismaMock.sgaSaleOrder.create.mockResolvedValue(makeSgaOrder());

    const created = await createSgaSaleOrder({
      sgaItemId: "sga-meja",
      buyerName: "Pembeli SGA",
      buyerType: "",
      salePrice: 250000,
      saleDate: "2026-05-24",
      note: ""
    });

    expect(prismaMock.sgaSaleOrder.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          sgaItemId: "sga-meja",
          status: "APPROVAL",
          createdById: "user-admin-pusat"
        })
      })
    );
    expect(prismaMock.sgaItem.update).toHaveBeenCalledWith({
      where: { id: "sga-meja" },
      data: { transactionStatus: "DALAM_ORDER" }
    });
    expect(created.status).toBe("APPROVAL");
  });

  it("rejects free edit and delete for SGA that is already sold", async () => {
    prismaMock.sgaItem.findUnique.mockResolvedValue(makeSgaRecord({ transactionStatus: "TERJUAL" }));

    await expect(updateSgaItem("sga-meja", { id: "sga-meja", itemName: "Nama baru" })).rejects.toThrow(
      "Data SGA sudah dalam order atau terjual dan tidak dapat diedit."
    );

    prismaMock.sgaSaleOrder.findFirst.mockResolvedValue(makeSgaOrder({ status: "TERJUAL" }));

    await expect(deleteSgaItem("sga-meja")).rejects.toThrow("Data SGA sudah memiliki transaksi dan tidak dapat dihapus.");
  });

  it("calculates SGA stats and exports SGA CSV", async () => {
    prismaMock.sgaItem.count.mockResolvedValueOnce(3).mockResolvedValueOnce(2).mockResolvedValueOnce(1).mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    prismaMock.sgaItem.findMany
      .mockResolvedValueOnce([{ quantity: 5 }, { quantity: 10 }, { quantity: 2 }])
      .mockResolvedValueOnce([{ branchId: "branch-sirclo" }, { branchId: "branch-cargo" }]);

    await expect(getSgaStats()).resolves.toEqual({
      total: 3,
      totalQuantity: 17,
      saleable: 2,
      notSaleable: 1,
      inOrder: 1,
      sold: 0,
      activeBranches: 2
    });

    prismaMock.sgaItem.findMany.mockResolvedValue([makeSgaRecord()]);
    const csv = await exportSgaCsv();

    expect(csv.split("\n")[0]).toBe(
      '"No","Tanggal Input","Nomor TLS","Cabang","Nama Barang","Jumlah","PIC Input","Status Kelayakan","Status Transaksi","Keterangan"'
    );
  });
});
