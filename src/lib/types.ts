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

export type BranchDTO = {
  id: string;
  name: string;
  code: string | null;
  regional: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UserDTO = {
  id: string;
  name: string;
  email: string;
  role: Role;
  roleLabel: string;
  branchId: string | null;
  branchName: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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

export type UsedGoodsSaleOrderDTO = {
  id: string;
  usedGoodsId: string;
  usedGoodsCode: string;
  usedGoodsName: string;
  categoryLabel: string;
  branchName: string;
  qty: number;
  unitLabel: string;
  buyerName: string;
  price: number;
  saleDate: string;
  status: SaleStatus;
  statusLabel: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UsedGoodsDTO = {
  id: string;
  code: string;
  branchId: string;
  branchName: string;
  branchCode: string | null;
  inputDate: string;
  name: string;
  category: UsedGoodsCategory;
  categoryLabel: string;
  qty: number;
  unit: UsedGoodsUnit;
  unitLabel: string;
  estimatedWeightKg: number | null;
  estimatedPrice: number | null;
  condition: UsedGoodsCondition;
  conditionLabel: string;
  storageLocation: string | null;
  pic: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UsedGoodsStats = {
  total: number;
  totalQty: number;
  saleable: number;
  notSaleable: number;
  totalWeightKg: number;
  activeBranches: number;
};

export type DashboardStats = {
  total: number;
  saleable: number;
  damaged: number;
  activeBranches: number;
  uniquePlates: number;
  uniquePjpp: number;
  usedGoods: UsedGoodsStats;
};

export type InitialData = {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: Role;
    branchId: string | null;
    branchName?: string | null;
    branchCode?: string | null;
  };
  branches: BranchDTO[];
  spareparts: SparepartDTO[];
  saleOrders: SaleOrderDTO[];
  usedGoodsSaleOrders: UsedGoodsSaleOrderDTO[];
  usedGoods: UsedGoodsDTO[];
  users: UserDTO[];
  stats: DashboardStats;
};
