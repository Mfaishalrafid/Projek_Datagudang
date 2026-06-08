import { describe, expect, it } from "vitest";
import {
  buildSparepartSaleIndex,
  buildUsedGoodsSaleIndex,
  getSgaEditLock,
  getSgaSaleAvailability,
  getSparepartEditLock,
  getSparepartSaleAvailability,
  getUsedGoodsEditLock,
  getUsedGoodsSaleAvailability
} from "@/lib/sale-availability";

describe("sale availability helpers", () => {
  it("marks sparepart without active order as available", () => {
    const index = buildSparepartSaleIndex([]);

    expect(getSparepartSaleAvailability({ id: "part-a" }, index)).toEqual({
      state: "AVAILABLE",
      label: "Jual",
      tone: "saleable",
      canSell: true
    });
    expect(getSparepartEditLock({ id: "part-a" }, index).canEdit).toBe(true);
  });

  it("locks sparepart while in order and after sold", () => {
    const index = buildSparepartSaleIndex([
      { sparepartId: "part-in-order", status: "APPROVAL" },
      { sparepartId: "part-sold", status: "TERJUAL" },
      { sparepartId: "part-cancelled", status: "BATAL" }
    ]);

    expect(getSparepartSaleAvailability({ id: "part-in-order" }, index)).toMatchObject({
      state: "IN_ORDER",
      label: "Dalam Order",
      canSell: false
    });
    expect(getSparepartEditLock({ id: "part-in-order" }, index).canEdit).toBe(false);

    expect(getSparepartSaleAvailability({ id: "part-sold" }, index)).toMatchObject({
      state: "SOLD",
      label: "Terjual",
      canSell: false
    });
    expect(getSparepartEditLock({ id: "part-sold" }, index).canDelete).toBe(false);

    expect(getSparepartSaleAvailability({ id: "part-cancelled" }, index).canSell).toBe(true);
  });

  it("calculates used goods available qty and jual sisa state", () => {
    const index = buildUsedGoodsSaleIndex([
      { usedGoodsId: "bb-a", qty: 3, status: "TERJUAL" },
      { usedGoodsId: "bb-a", qty: 2, status: "BATAL" }
    ]);

    expect(getUsedGoodsSaleAvailability({ id: "bb-a", qty: 5 }, index)).toEqual({
      qtyAwal: 5,
      qtyDalamOrder: 0,
      qtyTerjual: 3,
      qtyTersedia: 2,
      label: "Jual Sisa",
      tone: "saleable",
      canSell: true
    });
    expect(getUsedGoodsEditLock({ id: "bb-a", qty: 5 }, index)).toMatchObject({
      canEdit: false,
      label: "Terkunci"
    });
  });

  it("blocks used goods with active order or depleted stock", () => {
    const activeIndex = buildUsedGoodsSaleIndex([{ usedGoodsId: "bb-active", qty: 1, status: "APPROVAL" }]);
    const soldIndex = buildUsedGoodsSaleIndex([{ usedGoodsId: "bb-sold", qty: 5, status: "TERJUAL" }]);

    expect(getUsedGoodsSaleAvailability({ id: "bb-active", qty: 5 }, activeIndex)).toMatchObject({
      qtyTersedia: 4,
      label: "Dalam Order",
      canSell: false
    });
    expect(getUsedGoodsSaleAvailability({ id: "bb-sold", qty: 5 }, soldIndex)).toMatchObject({
      qtyTersedia: 0,
      label: "Habis",
      canSell: false
    });
  });

  it("maps SGA eligibility and transaction status to sale and edit states", () => {
    expect(getSgaSaleAvailability({ eligibilityStatus: "LAYAK_JUAL", transactionStatus: "TERSEDIA" })).toMatchObject({
      label: "Jual",
      canSell: true
    });
    expect(getSgaSaleAvailability({ eligibilityStatus: "LAYAK_JUAL", transactionStatus: "DALAM_ORDER" })).toMatchObject({
      label: "Dalam Order",
      canSell: false
    });
    expect(getSgaSaleAvailability({ eligibilityStatus: "LAYAK_JUAL", transactionStatus: "TERJUAL" })).toMatchObject({
      label: "Terjual",
      canSell: false
    });
    expect(getSgaSaleAvailability({ eligibilityStatus: "TIDAK_LAYAK", transactionStatus: "TERSEDIA" })).toMatchObject({
      label: "Tidak Layak",
      canSell: false
    });
    expect(getSgaEditLock({ transactionStatus: "TERJUAL" }).canEdit).toBe(false);
  });
});
