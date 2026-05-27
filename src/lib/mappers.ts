import {
  buyerTypeLabels,
  categoryLabels,
  conditionLabels,
  saleStatusLabels,
  roleLabels,
  usedGoodsCategoryLabels,
  usedGoodsConditionLabels,
  usedGoodsUnitLabels,
  vehicleTypeLabels
} from "@/data/options";
import type { BranchDTO, SaleOrderDTO, SparepartDTO, UsedGoodsDTO, UsedGoodsSaleOrderDTO, UserDTO } from "@/lib/types";
import type { Branch, SaleOrder, Sparepart, UsedGoods, UsedGoodsSaleOrder, User } from "@prisma/client";

type SparepartWithBranch = Sparepart & {
  branch: Branch;
};

type SaleOrderWithSparepart = SaleOrder & {
  sparepart: Sparepart & {
    branch: Branch;
  };
};

type UsedGoodsWithBranch = UsedGoods & {
  branch: Branch;
};

type UsedGoodsSaleOrderWithItem = UsedGoodsSaleOrder & {
  usedGoods: UsedGoods & {
    branch: Branch;
  };
};

type UserWithBranch = User & {
  branch: Branch | null;
};

export function toBranchDTO(branch: Branch): BranchDTO {
  return {
    id: branch.id,
    name: branch.name,
    code: branch.code,
    regional: branch.regional,
    city: branch.city,
    address: branch.address,
    phone: branch.phone,
    isActive: branch.isActive,
    createdAt: branch.createdAt.toISOString(),
    updatedAt: branch.updatedAt.toISOString()
  };
}

export function toUserDTO(user: UserWithBranch): UserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    roleLabel: roleLabels[user.role],
    branchId: user.branchId,
    branchName: user.branch?.name || null,
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

export function toSparepartDTO(sparepart: SparepartWithBranch): SparepartDTO {
  return {
    id: sparepart.id,
    pjpp: sparepart.pjpp,
    branchId: sparepart.branchId,
    branchName: sparepart.branch.name,
    branchCode: sparepart.branch.code,
    removedDate: sparepart.removedDate ? sparepart.removedDate.toISOString() : null,
    name: sparepart.name,
    category: sparepart.category,
    categoryLabel: categoryLabels[sparepart.category],
    plateNumber: sparepart.plateNumber,
    vehicleCode: sparepart.vehicleCode,
    vehicleType: sparepart.vehicleType,
    vehicleTypeLabel: vehicleTypeLabels[sparepart.vehicleType],
    condition: sparepart.condition,
    conditionLabel: conditionLabels[sparepart.condition],
    storageLocation: sparepart.storageLocation,
    notes: sparepart.notes,
    createdAt: sparepart.createdAt.toISOString(),
    updatedAt: sparepart.updatedAt.toISOString()
  };
}

export function toSaleOrderDTO(order: SaleOrderWithSparepart): SaleOrderDTO {
  return {
    id: order.id,
    sparepartId: order.sparepartId,
    sparepartName: order.sparepart.name,
    sparepartPjpp: order.sparepart.pjpp,
    branchName: order.sparepart.branch.name,
    buyerName: order.buyerName,
    buyerType: order.buyerType,
    buyerTypeLabel: buyerTypeLabels[order.buyerType],
    price: Number(order.price),
    saleDate: order.saleDate.toISOString(),
    status: order.status,
    statusLabel: saleStatusLabels[order.status],
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString()
  };
}

export function toUsedGoodsSaleOrderDTO(order: UsedGoodsSaleOrderWithItem): UsedGoodsSaleOrderDTO {
  return {
    id: order.id,
    usedGoodsId: order.usedGoodsId,
    usedGoodsCode: order.usedGoods.code,
    usedGoodsName: order.usedGoods.name,
    categoryLabel: usedGoodsCategoryLabels[order.usedGoods.category],
    branchName: order.usedGoods.branch.name,
    qty: Number(order.qty),
    unitLabel: usedGoodsUnitLabels[order.usedGoods.unit],
    buyerName: order.buyerName,
    price: Number(order.price),
    saleDate: order.saleDate.toISOString(),
    status: order.status,
    statusLabel: saleStatusLabels[order.status],
    notes: order.notes,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString()
  };
}

export function toUsedGoodsDTO(item: UsedGoodsWithBranch): UsedGoodsDTO {
  return {
    id: item.id,
    code: item.code,
    branchId: item.branchId,
    branchName: item.branch.name,
    branchCode: item.branch.code,
    inputDate: item.inputDate.toISOString(),
    name: item.name,
    category: item.category,
    categoryLabel: usedGoodsCategoryLabels[item.category],
    qty: Number(item.qty),
    unit: item.unit,
    unitLabel: usedGoodsUnitLabels[item.unit],
    estimatedWeightKg: item.estimatedWeightKg === null ? null : Number(item.estimatedWeightKg),
    estimatedPrice: item.estimatedPrice === null ? null : Number(item.estimatedPrice),
    condition: item.condition,
    conditionLabel: usedGoodsConditionLabels[item.condition],
    storageLocation: item.storageLocation,
    pic: item.pic,
    notes: item.notes,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString()
  };
}
