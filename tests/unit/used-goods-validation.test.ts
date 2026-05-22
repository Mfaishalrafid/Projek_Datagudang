import { afterEach, describe, expect, it, vi } from "vitest";
import { usedGoodsCategoryOptions, usedGoodsUnitOptions } from "@/data/options";
import { usedGoodsInputSchema } from "@/lib/validations";

const validPayload = {
  branchId: "branch-sirclo",
  inputDate: "2026-05-21",
  name: "Kardus Bekas",
  category: "KARDUS_KARTON" as const,
  qty: 10,
  unit: "PCS" as const,
  estimatedWeightKg: null,
  estimatedPrice: null,
  condition: "LAYAK_JUAL" as const,
  storageLocation: "Gudang",
  pic: "Vincent",
  notes: ""
};

describe("used goods validation", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts a complete valid payload", () => {
    const parsed = usedGoodsInputSchema.parse(validPayload);

    expect(parsed).toMatchObject({
      branchId: "branch-sirclo",
      name: "Kardus Bekas",
      condition: "LAYAK_JUAL",
      category: "KARDUS_KARTON",
      unit: "PCS"
    });
  });

  it("requires name, branch, and positive qty", () => {
    expect(usedGoodsInputSchema.safeParse({ ...validPayload, name: "" }).success).toBe(false);
    expect(usedGoodsInputSchema.safeParse({ ...validPayload, branchId: "" }).success).toBe(false);
    expect(usedGoodsInputSchema.safeParse({ ...validPayload, qty: 0 }).success).toBe(false);
    expect(usedGoodsInputSchema.safeParse({ ...validPayload, qty: undefined }).success).toBe(false);
  });

  it("defaults inputDate to today when omitted", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-22T04:00:00.000Z"));

    const parsed = usedGoodsInputSchema.parse({ ...validPayload, inputDate: undefined });

    expect(parsed.inputDate).toBe("2026-05-22");
  });

  it("rejects values outside the v3 condition, category, and unit lists", () => {
    expect(usedGoodsInputSchema.safeParse({ ...validPayload, condition: "RUSAK" }).success).toBe(false);
    expect(usedGoodsInputSchema.safeParse({ ...validPayload, category: "BAN" }).success).toBe(false);
    expect(usedGoodsInputSchema.safeParse({ ...validPayload, unit: "box" }).success).toBe(false);
  });

  it("keeps the category and unit options aligned with the client reference", () => {
    expect(usedGoodsCategoryOptions.map((item) => item.label)).toEqual([
      "Kardus & Karton",
      "Plastik",
      "Besi & Logam",
      "Kertas & Arsip",
      "Kayu & Palet",
      "Elektronik Bekas",
      "Tekstil & Kain",
      "Kaca",
      "Lainnya"
    ]);

    expect(usedGoodsUnitOptions.map((item) => item.label)).toEqual(["pcs", "kg", "lembar", "ikat", "karung", "unit", "set", "roll", "dus"]);
  });
});
