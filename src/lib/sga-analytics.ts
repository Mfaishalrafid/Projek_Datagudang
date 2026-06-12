import type { SgaEligibilityStatus, SgaTransactionStatus } from "@prisma/client";
import type { SgaStats } from "@/lib/types";

type SgaStatsItem = {
  branchId: string;
  quantity: number | string | { toString(): string } | null;
  eligibilityStatus: SgaEligibilityStatus;
  transactionStatus: SgaTransactionStatus;
};

export function calculateSgaStats(items: SgaStatsItem[]): SgaStats {
  const stats: SgaStats = {
    total: 0,
    totalQuantity: 0,
    saleable: 0,
    notSaleable: 0,
    inOrder: 0,
    sold: 0,
    activeBranches: 0
  };
  const branches = new Set<string>();

  for (const item of items) {
    stats.total += 1;
    stats.totalQuantity += Number(item.quantity || 0);
    stats.saleable += item.eligibilityStatus === "LAYAK_JUAL" ? 1 : 0;
    stats.notSaleable += item.eligibilityStatus === "TIDAK_LAYAK" ? 1 : 0;
    stats.inOrder += item.transactionStatus === "DALAM_ORDER" ? 1 : 0;
    stats.sold += item.transactionStatus === "TERJUAL" ? 1 : 0;
    branches.add(item.branchId);
  }

  stats.activeBranches = branches.size;
  return stats;
}
