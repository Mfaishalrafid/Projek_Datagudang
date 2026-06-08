import { describe, expect, it } from "vitest";
import { calculateDashboardStatsFromData } from "@/lib/dashboard-stats";
import { sgaItems, spareparts, stats, usedGoods } from "../fixtures";

describe("dashboard stats", () => {
  it("derives dashboard stats from already-loaded domain data", () => {
    expect(calculateDashboardStatsFromData(spareparts, usedGoods, sgaItems)).toEqual(stats);
  });

  it("returns empty SGA stats when no SGA data is available for the current role", () => {
    expect(calculateDashboardStatsFromData(spareparts, usedGoods).sga).toEqual({
      total: 0,
      totalQuantity: 0,
      saleable: 0,
      notSaleable: 0,
      inOrder: 0,
      sold: 0,
      activeBranches: 0
    });
  });
});
