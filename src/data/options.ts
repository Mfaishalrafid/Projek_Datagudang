import type {
  BuyerType,
  Category,
  Condition,
  SaleStatus,
  Role,
  UsedGoodsCategory,
  UsedGoodsCondition,
  UsedGoodsUnit,
  VehicleCode,
  VehicleType
} from "@prisma/client";

export const branchSeeds = [
  { name: "SPI RANGKASBITUNG", code: "SPI-RKS", regional: "Banten", city: "Rangkasbitung" },
  { name: "IGR CIPUTAT", code: "IGR-CPT", regional: "Jabodetabek", city: "Ciputat" },
  { name: "IGR CIKOKOL", code: "IGR-CKL", regional: "Banten", city: "Tangerang" },
  { name: "IGRSMG", code: "IGR-SMG", regional: "Jawa Tengah", city: "Semarang" },
  { name: "Sirclo", code: "SIRCLO", regional: "Jabodetabek", city: "Tangerang" },
  { name: "GW Cargo TGR", code: "GW-TGR", regional: "Jabodetabek", city: "Tangerang" },
  { name: "GW Ecomm", code: "GW-ECOMM", regional: "Jabodetabek", city: "Jakarta" },
  { name: "HUB JKT 1", code: "HUB-JKT1", regional: "Jabodetabek", city: "Jakarta" }
] as const;

export const categoryLabels: Record<Category, string> = {
  BAN: "Ban",
  FILTER_OLI: "Filter & Oli",
  REM_KAMPAS: "Rem & Kampas",
  TRANSMISI: "Transmisi",
  MESIN: "Mesin",
  ELEKTRIKAL: "Elektrikal",
  OTHERS: "Others"
};

export const categoryByLabel: Record<string, Category> = {
  Ban: "BAN",
  "Filter & Oli": "FILTER_OLI",
  "Rem & Kampas": "REM_KAMPAS",
  Transmisi: "TRANSMISI",
  Mesin: "MESIN",
  Elektrikal: "ELEKTRIKAL",
  Others: "OTHERS"
};

export const conditionLabels: Record<Condition, string> = {
  LAYAK_JUAL: "LAYAK JUAL",
  RUSAK: "RUSAK"
};

export const conditionByLabel: Record<string, Condition> = {
  "LAYAK JUAL": "LAYAK_JUAL",
  RUSAK: "RUSAK"
};

export const vehicleTypeLabels: Record<VehicleType, string> = {
  ENGKEL: "ENGKEL",
  DOUBLE: "DOUBLE",
  BLIND_VAN: "BLIND VAN",
  L300: "L300"
};

export const vehicleTypeByCode: Record<VehicleCode, VehicleType> = {
  CDE: "ENGKEL",
  CDD: "DOUBLE",
  BV: "BLIND_VAN",
  L300: "L300"
};

export const buyerTypeLabels: Record<BuyerType, string> = {
  PELANGGAN_UMUM: "Pelanggan Umum",
  MITRA_BENGKEL: "Mitra Bengkel",
  INTERNAL: "Internal"
};

export const saleStatusLabels: Record<SaleStatus, string> = {
  APPROVAL: "Approval",
  TERJUAL: "Terjual",
  BATAL: "Batal"
};

export const roleLabels: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN_PUSAT: "Admin Pusat",
  ADMIN_CABANG: "Admin Cabang",
  KARYAWAN_CABANG: "Karyawan Cabang"
};

export const usedGoodsConditionLabels: Record<UsedGoodsCondition, string> = {
  LAYAK_JUAL: "LAYAK JUAL",
  TIDAK_LAYAK: "TIDAK LAYAK"
};

export const usedGoodsConditionByLabel: Record<string, UsedGoodsCondition> = {
  "LAYAK JUAL": "LAYAK_JUAL",
  "TIDAK LAYAK": "TIDAK_LAYAK"
};

export const usedGoodsCategoryLabels: Record<UsedGoodsCategory, string> = {
  KARDUS_KARTON: "Kardus & Karton",
  PLASTIK: "Plastik",
  BESI_LOGAM: "Besi & Logam",
  KERTAS_ARSIP: "Kertas & Arsip",
  KAYU_PALET: "Kayu & Palet",
  ELEKTRONIK_BEKAS: "Elektronik Bekas",
  TEKSTIL_KAIN: "Tekstil & Kain",
  KACA: "Kaca",
  LAINNYA: "Lainnya"
};

export const usedGoodsCategoryByLabel: Record<string, UsedGoodsCategory> = {
  "Kardus & Karton": "KARDUS_KARTON",
  Plastik: "PLASTIK",
  "Besi & Logam": "BESI_LOGAM",
  "Kertas & Arsip": "KERTAS_ARSIP",
  "Kayu & Palet": "KAYU_PALET",
  "Elektronik Bekas": "ELEKTRONIK_BEKAS",
  "Tekstil & Kain": "TEKSTIL_KAIN",
  Kaca: "KACA",
  Lainnya: "LAINNYA"
};

export const usedGoodsUnitLabels: Record<UsedGoodsUnit, string> = {
  PCS: "pcs",
  KG: "kg",
  LEMBAR: "lembar",
  IKAT: "ikat",
  KARUNG: "karung",
  UNIT: "unit",
  SET: "set",
  ROLL: "roll",
  DUS: "dus"
};

export const usedGoodsUnitByLabel: Record<string, UsedGoodsUnit> = {
  pcs: "PCS",
  kg: "KG",
  lembar: "LEMBAR",
  ikat: "IKAT",
  karung: "KARUNG",
  unit: "UNIT",
  set: "SET",
  roll: "ROLL",
  dus: "DUS"
};

export const categoryOptions = Object.entries(categoryLabels).map(([value, label]) => ({
  value: value as Category,
  label
}));

export const conditionOptions = Object.entries(conditionLabels).map(([value, label]) => ({
  value: value as Condition,
  label
}));

export const vehicleCodeOptions: VehicleCode[] = ["CDE", "CDD", "BV", "L300"];
export const vehicleTypeOptions = Object.entries(vehicleTypeLabels).map(([value, label]) => ({
  value: value as VehicleType,
  label
}));

export const buyerTypeOptions = Object.entries(buyerTypeLabels).map(([value, label]) => ({
  value: value as BuyerType,
  label
}));

export const usedGoodsConditionOptions = Object.entries(usedGoodsConditionLabels).map(([value, label]) => ({
  value: value as UsedGoodsCondition,
  label
}));

export const usedGoodsCategoryOptions = Object.entries(usedGoodsCategoryLabels).map(([value, label]) => ({
  value: value as UsedGoodsCategory,
  label
}));

export const usedGoodsUnitOptions = Object.entries(usedGoodsUnitLabels).map(([value, label]) => ({
  value: value as UsedGoodsUnit,
  label
}));

export const roleOptions = Object.entries(roleLabels).map(([value, label]) => ({
  value: value as Role,
  label
}));

export const assignableRoleOptions = roleOptions.filter((item) => item.value !== "SUPER_ADMIN");
