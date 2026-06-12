import type { UsedGoodsCondition } from "@prisma/client";
import type { UsedGoodsStats } from "@/lib/types";

type UsedGoodsStatsItem = {
  branchId: string;
  qty: number | string | { toString(): string } | null;
  estimatedWeightKg: number | string | { toString(): string } | null;
  condition: UsedGoodsCondition;
};

export function calculateUsedGoodsStats(items: UsedGoodsStatsItem[]): UsedGoodsStats {
  const stats: UsedGoodsStats = {
    total: 0,
    totalQty: 0,
    saleable: 0,
    notSaleable: 0,
    totalWeightKg: 0,
    activeBranches: 0
  };
  const branches = new Set<string>();

  for (const item of items) {
    stats.total += 1;
    stats.totalQty += Number(item.qty || 0);
    stats.saleable += item.condition === "LAYAK_JUAL" ? 1 : 0;
    stats.notSaleable += item.condition === "TIDAK_LAYAK" ? 1 : 0;
    stats.totalWeightKg += Number(item.estimatedWeightKg || 0);
    branches.add(item.branchId);
  }

  stats.activeBranches = branches.size;
  return stats;
}
