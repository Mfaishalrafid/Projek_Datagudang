import { describe, expect, it } from "vitest";
import { calculateSgaStats } from "@/lib/sga-analytics";
import { sgaItems } from "../fixtures";

describe("SGA analytics", () => {
  it("calculates total, quantity, eligibility, transaction, and branch stats", () => {
    expect(calculateSgaStats(sgaItems)).toEqual({
      total: 3,
      totalQuantity: 17,
      saleable: 2,
      notSaleable: 1,
      inOrder: 1,
      sold: 0,
      activeBranches: 3
    });
  });
});
