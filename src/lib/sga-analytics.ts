import type { SgaEligibilityStatus, SgaTransactionStatus } from "@prisma/client";
import type { SgaStats } from "@/lib/types";

type SgaStatsItem = {
  branchId: string;
  quantity: number | string | null;
  eligibilityStatus: SgaEligibilityStatus;
  transactionStatus: SgaTransactionStatus;
};

export function calculateSgaStats(items: SgaStatsItem[]): SgaStats {
  return {
    total: items.length,
    totalQuantity: items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    saleable: items.filter((item) => item.eligibilityStatus === "LAYAK_JUAL").length,
    notSaleable: items.filter((item) => item.eligibilityStatus === "TIDAK_LAYAK").length,
    inOrder: items.filter((item) => item.transactionStatus === "DALAM_ORDER").length,
    sold: items.filter((item) => item.transactionStatus === "TERJUAL").length,
    activeBranches: new Set(items.map((item) => item.branchId)).size
  };
}
