import type { UsedGoodsCondition } from "@prisma/client";
import type { UsedGoodsStats } from "@/lib/types";

type UsedGoodsStatsItem = {
  branchId: string;
  qty: number | string | null;
  estimatedWeightKg: number | string | null;
  condition: UsedGoodsCondition;
};

export function calculateUsedGoodsStats(items: UsedGoodsStatsItem[]): UsedGoodsStats {
  return {
    total: items.length,
    totalQty: items.reduce((sum, item) => sum + Number(item.qty || 0), 0),
    saleable: items.filter((item) => item.condition === "LAYAK_JUAL").length,
    notSaleable: items.filter((item) => item.condition === "TIDAK_LAYAK").length,
    totalWeightKg: items.reduce((sum, item) => sum + Number(item.estimatedWeightKg || 0), 0),
    activeBranches: new Set(items.map((item) => item.branchId)).size
  };
}
