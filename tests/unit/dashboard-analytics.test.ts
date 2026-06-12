import { describe, expect, it } from "vitest";
import {
  groupSgaItems,
  groupSpareparts,
  groupUsedGoods,
  sgaTrendEntries,
  sparepartTrendEntries
} from "@/lib/dashboard-analytics";
import { sgaItems, spareparts, usedGoods } from "../fixtures";

describe("dashboard analytics helpers", () => {
  it("groups dashboard data consistently across modules", () => {
    expect(groupSpareparts(spareparts, (item) => item.branchName)[0]).toMatchObject({
      label: "SPI RANGKASBITUNG",
      total: 2,
      saleable: 1,
      damaged: 1
    });
    expect(groupUsedGoods(usedGoods, (item) => item.branchName)[0]).toMatchObject({
      label: "Sirclo",
      total: 2,
      totalQty: 272,
      saleable: 1,
      notSaleable: 1,
      totalWeightKg: 1
    });
    expect(groupSgaItems(sgaItems, (item) => item.branchName).find((row) => row.label === "Sirclo")).toMatchObject({
      label: "Sirclo",
      total: 1,
      totalQuantity: 5,
      saleable: 1,
      notSaleable: 0
    });
  });

  it("builds monthly trend entries for sparepart and SGA input dates", () => {
    expect(sparepartTrendEntries(spareparts)).toEqual([
      { label: "Mar", value: 1 },
      { label: "Apr", value: 1 }
    ]);
    expect(sgaTrendEntries(sgaItems)).toEqual([{ label: "Mei", value: 3 }]);
  });
});
