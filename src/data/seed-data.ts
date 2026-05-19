import { categoryByLabel, conditionByLabel, vehicleTypeByCode } from "./options";
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
