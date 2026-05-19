import {
  buyerTypeLabels,
  categoryLabels,
  conditionLabels,
  saleStatusLabels,
  vehicleTypeLabels
} from "@/data/options";
import type { BranchDTO, SaleOrderDTO, SparepartDTO } from "@/lib/types";
import type { Branch, SaleOrder, Sparepart } from "@prisma/client";

type SparepartWithBranch = Sparepart & {
  branch: Branch;
};

type SaleOrderWithSparepart = SaleOrder & {
  sparepart: Sparepart & {
    branch: Branch;
  };
};

export function toBranchDTO(branch: Branch): BranchDTO {
  return {
    id: branch.id,
    name: branch.name,
    code: branch.code
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
