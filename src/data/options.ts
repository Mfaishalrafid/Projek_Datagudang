import type {
  BuyerType,
  Category,
  Condition,
  SaleStatus,
  VehicleCode,
  VehicleType
} from "@prisma/client";

export const branchSeeds = [
  { name: "SPI RANGKASBITUNG", code: "SPI-RKS" },
  { name: "IGR CIPUTAT", code: "IGR-CPT" },
  { name: "IGR CIKOKOL", code: "IGR-CKL" }
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
