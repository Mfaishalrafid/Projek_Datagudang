import type { SgaItemDTO, SparepartDTO, UsedGoodsDTO } from "@/lib/types";

export type SparepartGroupRow = {
  label: string;
  total: number;
  saleable: number;
  damaged: number;
  items: SparepartDTO[];
};

export type UsedGoodsGroupRow = {
  label: string;
  total: number;
  totalQty: number;
  saleable: number;
  notSaleable: number;
  totalWeightKg: number;
  items: UsedGoodsDTO[];
};

export type SgaGroupRow = {
  label: string;
  total: number;
  totalQuantity: number;
  saleable: number;
  notSaleable: number;
  inOrder: number;
  sold: number;
  items: SgaItemDTO[];
};

export type TrendEntry = {
  label: string;
  value: number;
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export function groupSpareparts(data: SparepartDTO[], selector: (item: SparepartDTO) => string): SparepartGroupRow[] {
  const groups = new Map<string, SparepartGroupRow>();

  for (const item of data) {
    const label = selector(item) || "Unknown";
    const row = groups.get(label) || { label, total: 0, saleable: 0, damaged: 0, items: [] };
    row.total += 1;
    row.saleable += item.condition === "LAYAK_JUAL" ? 1 : 0;
    row.damaged += item.condition === "RUSAK" ? 1 : 0;
    row.items.push(item);
    groups.set(label, row);
  }

  return sortGroups(groups.values());
}

export function groupUsedGoods(data: UsedGoodsDTO[], selector: (item: UsedGoodsDTO) => string): UsedGoodsGroupRow[] {
  const groups = new Map<string, UsedGoodsGroupRow>();

  for (const item of data) {
    const label = selector(item) || "Unknown";
    const row = groups.get(label) || {
      label,
      total: 0,
      totalQty: 0,
      saleable: 0,
      notSaleable: 0,
      totalWeightKg: 0,
      items: []
    };
    row.total += 1;
    row.totalQty += item.qty;
    row.saleable += item.condition === "LAYAK_JUAL" ? 1 : 0;
    row.notSaleable += item.condition === "TIDAK_LAYAK" ? 1 : 0;
    row.totalWeightKg += item.estimatedWeightKg || 0;
    row.items.push(item);
    groups.set(label, row);
  }

  return sortGroups(groups.values());
}

export function groupSgaItems(data: SgaItemDTO[], selector: (item: SgaItemDTO) => string): SgaGroupRow[] {
  const groups = new Map<string, SgaGroupRow>();

  for (const item of data) {
    const label = selector(item) || "Unknown";
    const row = groups.get(label) || {
      label,
      total: 0,
      totalQuantity: 0,
      saleable: 0,
      notSaleable: 0,
      inOrder: 0,
      sold: 0,
      items: []
    };
    row.total += 1;
    row.totalQuantity += item.quantity;
    row.saleable += item.eligibilityStatus === "LAYAK_JUAL" ? 1 : 0;
    row.notSaleable += item.eligibilityStatus === "TIDAK_LAYAK" ? 1 : 0;
    row.inOrder += item.transactionStatus === "DALAM_ORDER" ? 1 : 0;
    row.sold += item.transactionStatus === "TERJUAL" ? 1 : 0;
    row.items.push(item);
    groups.set(label, row);
  }

  return sortGroups(groups.values());
}

export function sparepartTrendEntries(data: SparepartDTO[]): TrendEntry[] {
  return buildMonthlyTrend(data, (item) => item.removedDate);
}

export function sgaTrendEntries(data: SgaItemDTO[]): TrendEntry[] {
  return buildMonthlyTrend(data, (item) => item.inputDate);
}

function buildMonthlyTrend<T>(data: T[], getDate: (item: T) => string | null | undefined): TrendEntry[] {
  const monthlyTotals = new Map<string, number>();

  for (const item of data) {
    const date = getDate(item);
    const key = date ? date.slice(0, 7) : "Unknown";
    monthlyTotals.set(key, (monthlyTotals.get(key) || 0) + 1);
  }

  return [...monthlyTotals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      if (key === "Unknown") return { label: "N/A", value };
      const month = Number(key.slice(5, 7)) - 1;
      return { label: monthNames[month] || key, value };
    });
}

function sortGroups<T extends { label: string; total: number }>(groups: Iterable<T>) {
  return [...groups].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
}
