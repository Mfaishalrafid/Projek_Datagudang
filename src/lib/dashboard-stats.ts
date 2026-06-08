import { calculateSgaStats } from "@/lib/sga-analytics";
import type { DashboardStats } from "@/lib/types";
import { calculateUsedGoodsStats } from "@/lib/used-goods-analytics";
import type { Condition } from "@prisma/client";

type SparepartStatsItem = {
  branchId: string;
  plateNumber: string;
  pjpp: string;
  condition: Condition;
};

export function calculateDashboardStatsFromData(
  spareparts: SparepartStatsItem[],
  usedGoods: Parameters<typeof calculateUsedGoodsStats>[0],
  sgaItems: Parameters<typeof calculateSgaStats>[0] = []
): DashboardStats {
  return {
    total: spareparts.length,
    saleable: spareparts.filter((item) => item.condition === "LAYAK_JUAL").length,
    damaged: spareparts.filter((item) => item.condition === "RUSAK").length,
    activeBranches: new Set(spareparts.map((item) => item.branchId)).size,
    uniquePlates: new Set(spareparts.map((item) => item.plateNumber)).size,
    uniquePjpp: new Set(spareparts.map((item) => item.pjpp)).size,
    usedGoods: calculateUsedGoodsStats(usedGoods),
    sga: calculateSgaStats(sgaItems)
  };
}
