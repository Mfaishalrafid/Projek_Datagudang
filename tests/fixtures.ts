import type { BranchDTO, DashboardStats, InitialData, SaleOrderDTO, SparepartDTO, UsedGoodsDTO } from "@/lib/types";

export const branches: BranchDTO[] = [
  { id: "branch-spi", name: "SPI RANGKASBITUNG", code: "SPI-RKS" },
  { id: "branch-sirclo", name: "Sirclo", code: "SIRCLO" },
  { id: "branch-cargo", name: "GW Cargo TGR", code: "GW-TGR" },
  { id: "branch-empty", name: "Cabang Kosong", code: "EMPTY" }
];

export const spareparts: SparepartDTO[] = [
  {
    id: "part-ban",
    pjpp: "R3/RJPP/DMS/BON/111/2026",
    branchId: "branch-spi",
    branchName: "SPI RANGKASBITUNG",
    branchCode: "SPI-RKS",
    removedDate: "2026-04-17T00:00:00.000Z",
    name: "BAN LUAR R-15",
    category: "BAN",
    categoryLabel: "Ban",
    plateNumber: "B 9308 UXD",
    vehicleCode: "CDE",
    vehicleType: "ENGKEL",
    vehicleTypeLabel: "ENGKEL",
    condition: "LAYAK_JUAL",
    conditionLabel: "LAYAK JUAL",
    storageLocation: "SPI RANGKASBITUNG",
    notes: null,
    createdAt: "2026-05-21T00:00:00.000Z",
    updatedAt: "2026-05-21T00:00:00.000Z"
  },
  {
    id: "part-filter",
    pjpp: "347/PJPPU/DMS/III/2026",
    branchId: "branch-spi",
    branchName: "SPI RANGKASBITUNG",
    branchCode: "SPI-RKS",
    removedDate: "2026-03-31T00:00:00.000Z",
    name: "KTB OIL FILTER",
    category: "FILTER_OLI",
    categoryLabel: "Filter & Oli",
    plateNumber: "B 9309 UXD",
    vehicleCode: "CDE",
    vehicleType: "ENGKEL",
    vehicleTypeLabel: "ENGKEL",
    condition: "RUSAK",
    conditionLabel: "RUSAK",
    storageLocation: "SPI RANGKASBITUNG",
    notes: "Filter lama",
    createdAt: "2026-05-21T00:00:00.000Z",
    updatedAt: "2026-05-21T00:00:00.000Z"
  }
];

export const usedGoods: UsedGoodsDTO[] = [
  {
    id: "bb-kardus",
    code: "BB-20260521-0001",
    branchId: "branch-sirclo",
    branchName: "Sirclo",
    branchCode: "SIRCLO",
    inputDate: "2026-05-21T00:00:00.000Z",
    name: "Kardus Bekas",
    category: "KARDUS_KARTON",
    categoryLabel: "Kardus & Karton",
    qty: 270,
    unit: "PCS",
    unitLabel: "pcs",
    estimatedWeightKg: null,
    estimatedPrice: 0,
    condition: "LAYAK_JUAL",
    conditionLabel: "LAYAK JUAL",
    storageLocation: "GW Sirclo",
    pic: "Vincent",
    notes: null,
    createdAt: "2026-05-21T00:00:00.000Z",
    updatedAt: "2026-05-21T00:00:00.000Z"
  },
  {
    id: "bb-paku",
    code: "BB-20260502-0004",
    branchId: "branch-cargo",
    branchName: "GW Cargo TGR",
    branchCode: "GW-TGR",
    inputDate: "2026-05-02T00:00:00.000Z",
    name: "Paku bekas",
    category: "BESI_LOGAM",
    categoryLabel: "Besi & Logam",
    qty: 5,
    unit: "KG",
    unitLabel: "kg",
    estimatedWeightKg: 5,
    estimatedPrice: 0,
    condition: "LAYAK_JUAL",
    conditionLabel: "LAYAK JUAL",
    storageLocation: "HUB JKT 1",
    pic: "Hafiz",
    notes: "Layak timbang",
    createdAt: "2026-05-02T00:00:00.000Z",
    updatedAt: "2026-05-02T00:00:00.000Z"
  },
  {
    id: "bb-plastik",
    code: "BB-20260518-0002",
    branchId: "branch-sirclo",
    branchName: "Sirclo",
    branchCode: "SIRCLO",
    inputDate: "2026-05-18T00:00:00.000Z",
    name: "Plastik Sortir",
    category: "PLASTIK",
    categoryLabel: "Plastik",
    qty: 2,
    unit: "KARUNG",
    unitLabel: "karung",
    estimatedWeightKg: 1,
    estimatedPrice: null,
    condition: "TIDAK_LAYAK",
    conditionLabel: "TIDAK LAYAK",
    storageLocation: "Area sortir",
    pic: "Vincent",
    notes: null,
    createdAt: "2026-05-18T00:00:00.000Z",
    updatedAt: "2026-05-18T00:00:00.000Z"
  }
];

export const saleOrders: SaleOrderDTO[] = [];

export const stats: DashboardStats = {
  total: 2,
  saleable: 1,
  damaged: 1,
  activeBranches: 1,
  uniquePlates: 2,
  uniquePjpp: 2,
  usedGoods: {
    total: 3,
    totalQty: 277,
    saleable: 2,
    notSaleable: 1,
    totalWeightKg: 6,
    activeBranches: 2
  }
};

export function makeInitialData(overrides: Partial<InitialData> = {}): InitialData {
  return {
    branches,
    spareparts,
    saleOrders,
    usedGoods,
    stats,
    ...overrides
  };
}
