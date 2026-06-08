import type { SaleStatus, SgaEligibilityStatus, SgaTransactionStatus } from "@prisma/client";

type SparepartRef = {
  id: string;
};

type UsedGoodsRef = {
  id: string;
  qty: number;
};

type SgaRef = {
  eligibilityStatus: SgaEligibilityStatus;
  transactionStatus: SgaTransactionStatus;
};

type SparepartOrderRef = {
  sparepartId: string;
  status: SaleStatus;
};

type UsedGoodsOrderRef = {
  usedGoodsId: string;
  qty: number;
  status: SaleStatus;
};

export type BadgeTone = "saleable" | "approval" | "sold" | "damaged" | "amber";

export type SparepartSaleSummary = {
  hasApproval: boolean;
  hasSold: boolean;
};

export type UsedGoodsSaleSummary = {
  qtyDalamOrder: number;
  qtyTerjual: number;
};

export type SparepartSaleAvailability = {
  state: "AVAILABLE" | "IN_ORDER" | "SOLD";
  label: string;
  tone: Extract<BadgeTone, "saleable" | "approval" | "sold">;
  canSell: boolean;
};

export type UsedGoodsSaleAvailability = {
  qtyAwal: number;
  qtyDalamOrder: number;
  qtyTerjual: number;
  qtyTersedia: number;
  label: string;
  tone: Extract<BadgeTone, "saleable" | "approval" | "sold">;
  canSell: boolean;
};

export type SgaSaleAvailability = {
  label: string;
  tone: Extract<BadgeTone, "saleable" | "approval" | "sold" | "damaged">;
  canSell: boolean;
};

export type EditLockState = {
  canEdit: boolean;
  canDelete: boolean;
  label: string;
  tone: BadgeTone;
};

export function buildSparepartSaleIndex(orders: SparepartOrderRef[]) {
  const index = new Map<string, SparepartSaleSummary>();

  for (const order of orders) {
    if (order.status !== "APPROVAL" && order.status !== "TERJUAL") continue;
    const current = index.get(order.sparepartId) || { hasApproval: false, hasSold: false };
    index.set(order.sparepartId, {
      hasApproval: current.hasApproval || order.status === "APPROVAL",
      hasSold: current.hasSold || order.status === "TERJUAL"
    });
  }

  return index;
}

export function buildUsedGoodsSaleIndex(orders: UsedGoodsOrderRef[]) {
  const index = new Map<string, UsedGoodsSaleSummary>();

  for (const order of orders) {
    if (order.status !== "APPROVAL" && order.status !== "TERJUAL") continue;
    const current = index.get(order.usedGoodsId) || { qtyDalamOrder: 0, qtyTerjual: 0 };
    index.set(order.usedGoodsId, {
      qtyDalamOrder: current.qtyDalamOrder + (order.status === "APPROVAL" ? Number(order.qty) : 0),
      qtyTerjual: current.qtyTerjual + (order.status === "TERJUAL" ? Number(order.qty) : 0)
    });
  }

  return index;
}

export function getSparepartSaleAvailability(
  part: SparepartRef,
  saleIndex: Map<string, SparepartSaleSummary>
): SparepartSaleAvailability {
  const summary = saleIndex.get(part.id);

  if (summary?.hasSold) {
    return { state: "SOLD", label: "Terjual", tone: "sold", canSell: false };
  }
  if (summary?.hasApproval) {
    return { state: "IN_ORDER", label: "Dalam Order", tone: "approval", canSell: false };
  }
  return { state: "AVAILABLE", label: "Jual", tone: "saleable", canSell: true };
}

export function getUsedGoodsSaleAvailability(
  item: UsedGoodsRef,
  saleIndex: Map<string, UsedGoodsSaleSummary>
): UsedGoodsSaleAvailability {
  const summary = saleIndex.get(item.id) || { qtyDalamOrder: 0, qtyTerjual: 0 };
  const qtyTersedia = Math.max(0, Number(item.qty) - summary.qtyDalamOrder - summary.qtyTerjual);

  if (summary.qtyDalamOrder > 0) {
    return { qtyAwal: item.qty, ...summary, qtyTersedia, label: "Dalam Order", tone: "approval", canSell: false };
  }
  if (qtyTersedia <= 0) {
    return { qtyAwal: item.qty, ...summary, qtyTersedia, label: "Habis", tone: "sold", canSell: false };
  }
  if (summary.qtyTerjual > 0) {
    return { qtyAwal: item.qty, ...summary, qtyTersedia, label: "Jual Sisa", tone: "saleable", canSell: true };
  }
  return { qtyAwal: item.qty, ...summary, qtyTersedia, label: "Jual", tone: "saleable", canSell: true };
}

export function getSgaSaleAvailability(item: SgaRef): SgaSaleAvailability {
  if (item.eligibilityStatus !== "LAYAK_JUAL") {
    return { label: "Tidak Layak", tone: "damaged", canSell: false };
  }
  if (item.transactionStatus === "DALAM_ORDER") {
    return { label: "Dalam Order", tone: "approval", canSell: false };
  }
  if (item.transactionStatus === "TERJUAL") {
    return { label: "Terjual", tone: "sold", canSell: false };
  }
  return { label: "Jual", tone: "saleable", canSell: true };
}

export function getSparepartEditLock(part: SparepartRef, saleIndex: Map<string, SparepartSaleSummary>): EditLockState {
  const availability = getSparepartSaleAvailability(part, saleIndex);
  if (availability.state === "IN_ORDER") {
    return { canEdit: false, canDelete: false, label: "Dalam Order", tone: "approval" };
  }
  if (availability.state === "SOLD") {
    return { canEdit: false, canDelete: false, label: "Terjual", tone: "sold" };
  }
  return { canEdit: true, canDelete: true, label: "", tone: "saleable" };
}

export function getUsedGoodsEditLock(item: UsedGoodsRef, saleIndex: Map<string, UsedGoodsSaleSummary>): EditLockState {
  const availability = getUsedGoodsSaleAvailability(item, saleIndex);
  if (availability.qtyDalamOrder > 0) {
    return { canEdit: false, canDelete: false, label: "Dalam Order", tone: "approval" };
  }
  if (availability.qtyTerjual > 0 && availability.qtyTersedia <= 0) {
    return { canEdit: false, canDelete: false, label: "Habis", tone: "sold" };
  }
  if (availability.qtyTerjual > 0) {
    return { canEdit: false, canDelete: false, label: "Terkunci", tone: "amber" };
  }
  return { canEdit: true, canDelete: true, label: "", tone: "saleable" };
}

export function getSgaEditLock(item: Pick<SgaRef, "transactionStatus">): EditLockState {
  if (item.transactionStatus === "DALAM_ORDER") {
    return { canEdit: false, canDelete: false, label: "Dalam Order", tone: "approval" };
  }
  if (item.transactionStatus === "TERJUAL") {
    return { canEdit: false, canDelete: false, label: "Terjual", tone: "sold" };
  }
  return { canEdit: true, canDelete: true, label: "", tone: "saleable" };
}
