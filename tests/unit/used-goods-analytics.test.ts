import { describe, expect, it } from "vitest";
import { calculateUsedGoodsStats } from "@/lib/used-goods-analytics";
import { usedGoods } from "../fixtures";

describe("used goods stats calculator", () => {
  it("calculates totals, condition split, weight, and active branches", () => {
    expect(calculateUsedGoodsStats(usedGoods)).toEqual({
      total: 3,
      totalQty: 277,
      saleable: 2,
      notSaleable: 1,
      totalWeightKg: 6,
      activeBranches: 2
    });
  });
});
