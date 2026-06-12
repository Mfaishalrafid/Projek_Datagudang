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
  const sparepartStats = {
    total: 0,
    saleable: 0,
    damaged: 0,
    activeBranches: new Set<string>(),
    uniquePlates: new Set<string>(),
    uniquePjpp: new Set<string>()
  };

  for (const item of spareparts) {
    sparepartStats.total += 1;
    sparepartStats.saleable += item.condition === "LAYAK_JUAL" ? 1 : 0;
    sparepartStats.damaged += item.condition === "RUSAK" ? 1 : 0;
    sparepartStats.activeBranches.add(item.branchId);
    sparepartStats.uniquePlates.add(item.plateNumber.trim());
    sparepartStats.uniquePjpp.add(item.pjpp.trim());
  }

  return {
    total: sparepartStats.total,
    saleable: sparepartStats.saleable,
    damaged: sparepartStats.damaged,
    activeBranches: sparepartStats.activeBranches.size,
    uniquePlates: sparepartStats.uniquePlates.size,
    uniquePjpp: sparepartStats.uniquePjpp.size,
    usedGoods: calculateUsedGoodsStats(usedGoods),
    sga: calculateSgaStats(sgaItems)
  };
}
