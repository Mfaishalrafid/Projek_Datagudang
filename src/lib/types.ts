import type {
  BuyerType,
  Category,
  Condition,
  SaleStatus,
  VehicleCode,
  VehicleType
} from "@prisma/client";

export type BranchDTO = {
  id: string;
  name: string;
  code: string | null;
};

export type SparepartDTO = {
  id: string;
  pjpp: string;
  branchId: string;
  branchName: string;
  branchCode: string | null;
  removedDate: string | null;
  name: string;
  category: Category;
  categoryLabel: string;
  plateNumber: string;
  vehicleCode: VehicleCode;
  vehicleType: VehicleType;
  vehicleTypeLabel: string;
  condition: Condition;
  conditionLabel: string;
  storageLocation: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SaleOrderDTO = {
  id: string;
  sparepartId: string;
  sparepartName: string;
  sparepartPjpp: string;
  branchName: string;
  buyerName: string;
  buyerType: BuyerType;
  buyerTypeLabel: string;
  price: number;
  saleDate: string;
  status: SaleStatus;
  statusLabel: string;
  createdAt: string;
  updatedAt: string;
};

export type DashboardStats = {
  total: number;
  saleable: number;
  damaged: number;
  activeBranches: number;
  uniquePlates: number;
  uniquePjpp: number;
};

export type InitialData = {
  branches: BranchDTO[];
  spareparts: SparepartDTO[];
  saleOrders: SaleOrderDTO[];
  stats: DashboardStats;
};
