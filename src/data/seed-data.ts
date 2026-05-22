import {
  categoryByLabel,
  conditionByLabel,
  usedGoodsCategoryByLabel,
  usedGoodsConditionByLabel,
  usedGoodsUnitByLabel,
  vehicleTypeByCode
} from "./options";
import type { VehicleCode } from "@prisma/client";

type RawSparepartSeed = {
  pjpp: string;
  branchName: string;
  removedDate: string;
  name: string;
  categoryLabel: keyof typeof categoryByLabel;
  plateNumber: string;
  vehicleCode: VehicleCode;
  conditionLabel: keyof typeof conditionByLabel;
  storageLocation: string;
  notes: string;
};

type RawUsedGoodsSeed = {
  code: string;
  branchName: string;
  inputDate: string;
  name: string;
  categoryLabel: keyof typeof usedGoodsCategoryByLabel;
  conditionLabel: keyof typeof usedGoodsConditionByLabel;
  storageLocation: string;
  qty: number;
  unitLabel: keyof typeof usedGoodsUnitByLabel;
  estimatedWeightKg: number | null;
  estimatedPrice: number | null;
  pic: string;
  notes: string;
};

export const sparepartSeeds: RawSparepartSeed[] = [
  {
    pjpp: "R3/RJPP/DMS/BON/111/2026",
    branchName: "SPI RANGKASBITUNG",
    removedDate: "2026-04-17",
    name: "BAN LUAR R-15",
    categoryLabel: "Ban",
    plateNumber: "B 9308 UXD",
    vehicleCode: "CDE",
    conditionLabel: "LAYAK JUAL",
    storageLocation: "SPI RANGKASBITUNG",
    notes: ""
  },
  {
    pjpp: "347/PJPPU/DMS/III/2026",
    branchName: "SPI RANGKASBITUNG",
    removedDate: "2026-03-31",
    name: "KTB OIL FILTER",
    categoryLabel: "Filter & Oli",
    plateNumber: "B 9308 UXD",
    vehicleCode: "CDE",
    conditionLabel: "LAYAK JUAL",
    storageLocation: "SPI RANGKASBITUNG",
    notes: ""
  },
  {
    pjpp: "347/PJPPU/DMS/III/2026",
    branchName: "SPI RANGKASBITUNG",
    removedDate: "2026-03-31",
    name: "KTB AIR FILTER",
    categoryLabel: "Filter & Oli",
    plateNumber: "B 9308 UXD",
    vehicleCode: "CDE",
    conditionLabel: "LAYAK JUAL",
    storageLocation: "SPI RANGKASBITUNG",
    notes: ""
  },
  {
    pjpp: "412/PJPPU/DMS/III/2026",
    branchName: "IGR CIPUTAT",
    removedDate: "2026-01-21",
    name: "Rak and long Tie road",
    categoryLabel: "Rem & Kampas",
    plateNumber: "B 9216 UXE",
    vehicleCode: "BV",
    conditionLabel: "RUSAK",
    storageLocation: "IGR CIPUTAT",
    notes: ""
  },
  {
    pjpp: "859/PJPPU/DMS/III/2026",
    branchName: "IGR CIPUTAT",
    removedDate: "2026-04-03",
    name: "Gantungan ban stip mobil",
    categoryLabel: "Ban",
    plateNumber: "B 9478 UCS",
    vehicleCode: "CDE",
    conditionLabel: "LAYAK JUAL",
    storageLocation: "IGR CIPUTAT",
    notes: ""
  },
  {
    pjpp: "105/PJPPU/DMS/III/2026",
    branchName: "IGR CIPUTAT",
    removedDate: "2026-02-12",
    name: "Cros join copel L300",
    categoryLabel: "Transmisi",
    plateNumber: "B 9048 UXE",
    vehicleCode: "L300",
    conditionLabel: "RUSAK",
    storageLocation: "IGR CIPUTAT",
    notes: ""
  },
  {
    pjpp: "627/PJPPU/DMS/III/2026",
    branchName: "IGR CIPUTAT",
    removedDate: "2026-03-17",
    name: "Tie road canter",
    categoryLabel: "Ban",
    plateNumber: "B 9478 UCS",
    vehicleCode: "CDE",
    conditionLabel: "RUSAK",
    storageLocation: "IGR CIPUTAT",
    notes: ""
  },
  {
    pjpp: "284/PJPPU/DMS/III/2026",
    branchName: "IGR CIPUTAT",
    removedDate: "2026-04-09",
    name: "Drag link assy canter",
    categoryLabel: "Others",
    plateNumber: "B 9478 UCS",
    vehicleCode: "CDE",
    conditionLabel: "RUSAK",
    storageLocation: "IGR CIPUTAT",
    notes: ""
  },
  {
    pjpp: "931/PJPPU/DMS/III/2026",
    branchName: "IGR CIPUTAT",
    removedDate: "2026-01-02",
    name: "Plat kopling canter",
    categoryLabel: "Transmisi",
    plateNumber: "B 9478 UCS",
    vehicleCode: "CDE",
    conditionLabel: "RUSAK",
    storageLocation: "IGR CIPUTAT",
    notes: ""
  },
  {
    pjpp: "578/PJPPU/DMS/III/2026",
    branchName: "IGR CIPUTAT",
    removedDate: "2026-01-31",
    name: "Sock belakang canter",
    categoryLabel: "Others",
    plateNumber: "B 9478 UCS",
    vehicleCode: "CDE",
    conditionLabel: "RUSAK",
    storageLocation: "IGR CIPUTAT",
    notes: ""
  },
  {
    pjpp: "390/PJPPU/DMS/III/2026",
    branchName: "IGR CIPUTAT",
    removedDate: "2026-04-04",
    name: "Wifer canter",
    categoryLabel: "Others",
    plateNumber: "B 9478 UCS",
    vehicleCode: "CDE",
    conditionLabel: "RUSAK",
    storageLocation: "IGR CIPUTAT",
    notes: ""
  },
  {
    pjpp: "743/PJPPU/DMS/III/2026",
    branchName: "IGR CIPUTAT",
    removedDate: "2026-03-08",
    name: "Mika lampu kiri canter",
    categoryLabel: "Others",
    plateNumber: "B 9478 UCS",
    vehicleCode: "CDE",
    conditionLabel: "RUSAK",
    storageLocation: "IGR CIPUTAT",
    notes: ""
  },
  {
    pjpp: "166/PJPPU/DMS/III/2026",
    branchName: "IGR CIPUTAT",
    removedDate: "2026-04-18",
    name: "Baut copel canter",
    categoryLabel: "Transmisi",
    plateNumber: "B 9478 UCS",
    vehicleCode: "CDE",
    conditionLabel: "RUSAK",
    storageLocation: "IGR CIPUTAT",
    notes: ""
  },
  {
    pjpp: "529/PJPPU/DMS/III/2026",
    branchName: "IGR CIPUTAT",
    removedDate: "2026-05-02",
    name: "Tie road rak and long BV 9216",
    categoryLabel: "Ban",
    plateNumber: "B 9216 UXE",
    vehicleCode: "BV",
    conditionLabel: "RUSAK",
    storageLocation: "IGR CIPUTAT",
    notes: ""
  },
  {
    pjpp: "802/PJPPU/DMS/III/2026",
    branchName: "IGR CIPUTAT",
    removedDate: "2026-02-13",
    name: "Saringan filter udara canter",
    categoryLabel: "Filter & Oli",
    plateNumber: "B 9478 UCS",
    vehicleCode: "CDE",
    conditionLabel: "RUSAK",
    storageLocation: "IGR CIPUTAT",
    notes: ""
  },
  {
    pjpp: "047/PJPPU/DMS/III/2026",
    branchName: "IGR CIPUTAT",
    removedDate: "2026-04-07",
    name: "AKI CANTER",
    categoryLabel: "Others",
    plateNumber: "B 9478 UCS",
    vehicleCode: "CDE",
    conditionLabel: "LAYAK JUAL",
    storageLocation: "IGR CIPUTAT",
    notes: ""
  },
  {
    pjpp: "146/PJPP/DMS/BAN/IV/2026",
    branchName: "IGR CIKOKOL",
    removedDate: "2026-05-08",
    name: "Accu & Ban",
    categoryLabel: "Ban",
    plateNumber: "B 9564 CCH",
    vehicleCode: "CDE",
    conditionLabel: "LAYAK JUAL",
    storageLocation: "IGR CIKOKOL",
    notes: ""
  },
  {
    pjpp: "493/PJPP/DMS/IV/2026",
    branchName: "IGR CIKOKOL",
    removedDate: "2026-05-09",
    name: "Ganti packing dek blok mesin",
    categoryLabel: "Mesin",
    plateNumber: "B 9405 CCE",
    vehicleCode: "CDD",
    conditionLabel: "RUSAK",
    storageLocation: "IGR CIKOKOL",
    notes: ""
  },
  {
    pjpp: "269/PJPP/DMS/II/2026",
    branchName: "IGR CIKOKOL",
    removedDate: "2026-05-11",
    name: "Service Lampu rem",
    categoryLabel: "Elektrikal",
    plateNumber: "B 9856 UXG",
    vehicleCode: "CDE",
    conditionLabel: "RUSAK",
    storageLocation: "IGR CIKOKOL",
    notes: ""
  },
  {
    pjpp: "494/PJPP/DMS/IV/2026",
    branchName: "IGR CIKOKOL",
    removedDate: "2026-05-13",
    name: "Master Rem 5 pcs, Bantalan shock 2 pcs & klakson",
    categoryLabel: "Rem & Kampas",
    plateNumber: "B 9423 UCO",
    vehicleCode: "CDE",
    conditionLabel: "RUSAK",
    storageLocation: "IGR CIKOKOL",
    notes: ""
  },
  {
    pjpp: "399/PJPP/DMS/IV/2026",
    branchName: "IGRSMG",
    removedDate: "2026-03-04",
    name: "Ganti aki 2 pc (TRED IN)",
    categoryLabel: "Elektrikal",
    plateNumber: "B 9517 UXC",
    vehicleCode: "CDD",
    conditionLabel: "RUSAK",
    storageLocation: "IGRSMG",
    notes: ""
  },
  {
    pjpp: "170/PJPP/DMS/BAN/IV/2026",
    branchName: "IGRSMG",
    removedDate: "2026-04-15",
    name: "Ganti ban luar 2 pcs 750/16",
    categoryLabel: "Ban",
    plateNumber: "B 9517 UXC",
    vehicleCode: "CDD",
    conditionLabel: "RUSAK",
    storageLocation: "IGRSMG",
    notes: ""
  },
  {
    pjpp: "102/PJPP/DMS/BAN/III/2026",
    branchName: "IGRSMG",
    removedDate: "2026-04-10",
    name: "Ganti ban luar 2 pcs 750/16",
    categoryLabel: "Ban",
    plateNumber: "H 9391 NA",
    vehicleCode: "CDD",
    conditionLabel: "RUSAK",
    storageLocation: "IGRSMG",
    notes: ""
  },
  {
    pjpp: "355/PJPP/DMS/III/2026",
    branchName: "IGRSMG",
    removedDate: "2026-04-07",
    name: "Ganti wheel cylinder, draglink, king pin, item others",
    categoryLabel: "Others",
    plateNumber: "AB 8979 ZN",
    vehicleCode: "CDD",
    conditionLabel: "RUSAK",
    storageLocation: "IGRSMG",
    notes: ""
  },
  {
    pjpp: "162/PJPP/DMS/IIV/BAN/2026",
    branchName: "IGRSMG",
    removedDate: "2026-05-04",
    name: "Ganti ban tubeless 165/13 1 pcs",
    categoryLabel: "Ban",
    plateNumber: "B 9935 UXD",
    vehicleCode: "BV",
    conditionLabel: "RUSAK",
    storageLocation: "IGRSMG",
    notes: ""
  },
  {
    pjpp: "169/PJPP/DMS/BAN/IV/2026",
    branchName: "IGRSMG",
    removedDate: "2026-05-04",
    name: "Ganti ban 185/14 1 pcs",
    categoryLabel: "Ban",
    plateNumber: "B 9200 UXD",
    vehicleCode: "L300",
    conditionLabel: "RUSAK",
    storageLocation: "IGRSMG",
    notes: ""
  },
  {
    pjpp: "520/PJPP/DMS/IV/2026",
    branchName: "IGRSMG",
    removedDate: "2026-05-07",
    name: "Ganti kip rem, kampas rem, seal roda depan, laker roda depan dalam",
    categoryLabel: "Rem & Kampas",
    plateNumber: "B 9416 UXD",
    vehicleCode: "L300",
    conditionLabel: "RUSAK",
    storageLocation: "IGRSMG",
    notes: ""
  },
  {
    pjpp: "535/PJPP/DMS/V/2026",
    branchName: "IGRSMG",
    removedDate: "2026-05-12",
    name: "Wheel cylinder, Sanyco wheel cylinder, laker depan kanan & kiri",
    categoryLabel: "Rem & Kampas",
    plateNumber: "AB 8159 BU",
    vehicleCode: "CDD",
    conditionLabel: "RUSAK",
    storageLocation: "IGRSMG",
    notes: ""
  },
  {
    pjpp: "201/PJPP/DMS/BAN/V/2026",
    branchName: "IGRSMG",
    removedDate: "2026-05-18",
    name: "Ganti ban tubeless 165/13 1 pcs",
    categoryLabel: "Ban",
    plateNumber: "B 9758 UXD",
    vehicleCode: "BV",
    conditionLabel: "RUSAK",
    storageLocation: "IGRSMG",
    notes: ""
  },
  {
    pjpp: "566/PJPP/DMS/V/2026",
    branchName: "IGRSMG",
    removedDate: "2026-05-19",
    name: "Ganti aki",
    categoryLabel: "Elektrikal",
    plateNumber: "B 9416 UXD",
    vehicleCode: "L300",
    conditionLabel: "RUSAK",
    storageLocation: "IGRSMG",
    notes: ""
  }
];

export const usedGoodsSeeds: RawUsedGoodsSeed[] = [
  {
    code: "BB-20260521-0001",
    inputDate: "2026-05-21",
    branchName: "Sirclo",
    name: "Kardus Bekas",
    categoryLabel: "Kardus & Karton",
    conditionLabel: "LAYAK JUAL",
    storageLocation: "GW Sirclo",
    qty: 270,
    unitLabel: "pcs",
    estimatedWeightKg: null,
    estimatedPrice: 0,
    pic: "Vincent",
    notes: ""
  },
  {
    code: "BB-20260519-0002",
    inputDate: "2026-05-19",
    branchName: "GW Cargo TGR",
    name: "Palet",
    categoryLabel: "Kayu & Palet",
    conditionLabel: "LAYAK JUAL",
    storageLocation: "GW Cargo TGR",
    qty: 300,
    unitLabel: "pcs",
    estimatedWeightKg: null,
    estimatedPrice: 0,
    pic: "Breli",
    notes: ""
  },
  {
    code: "BB-20260405-0003",
    inputDate: "2026-04-05",
    branchName: "GW Ecomm",
    name: "Kertas",
    categoryLabel: "Kertas & Arsip",
    conditionLabel: "LAYAK JUAL",
    storageLocation: "GW Ecomm JKT",
    qty: 25,
    unitLabel: "kg",
    estimatedWeightKg: 25,
    estimatedPrice: 0,
    pic: "Danu",
    notes: ""
  },
  {
    code: "BB-20260502-0004",
    inputDate: "2026-05-02",
    branchName: "HUB JKT 1",
    name: "Paku bekas",
    categoryLabel: "Besi & Logam",
    conditionLabel: "LAYAK JUAL",
    storageLocation: "HUB JKT 1",
    qty: 5,
    unitLabel: "kg",
    estimatedWeightKg: 5,
    estimatedPrice: 0,
    pic: "Hafiz",
    notes: ""
  }
];

export function normalizeSeedRecord(item: RawSparepartSeed) {
  return {
    pjpp: item.pjpp,
    branchName: item.branchName,
    removedDate: item.removedDate,
    name: item.name,
    category: categoryByLabel[item.categoryLabel],
    plateNumber: item.plateNumber,
    vehicleCode: item.vehicleCode,
    vehicleType: vehicleTypeByCode[item.vehicleCode],
    condition: conditionByLabel[item.conditionLabel],
    storageLocation: item.storageLocation,
    notes: item.notes || null
  };
}

export function normalizeUsedGoodsSeedRecord(item: RawUsedGoodsSeed) {
  return {
    code: item.code,
    branchName: item.branchName,
    inputDate: item.inputDate,
    name: item.name,
    category: usedGoodsCategoryByLabel[item.categoryLabel],
    qty: item.qty,
    unit: usedGoodsUnitByLabel[item.unitLabel],
    estimatedWeightKg: item.estimatedWeightKg,
    estimatedPrice: item.estimatedPrice,
    condition: usedGoodsConditionByLabel[item.conditionLabel],
    storageLocation: item.storageLocation || null,
    pic: item.pic || null,
    notes: item.notes || null
  };
}
