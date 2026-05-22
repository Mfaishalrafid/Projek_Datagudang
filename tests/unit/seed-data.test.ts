import { describe, expect, it } from "vitest";
import { branchSeeds } from "@/data/options";
import { normalizeSeedRecord, normalizeUsedGoodsSeedRecord, sparepartSeeds, usedGoodsSeeds } from "@/data/seed-data";

describe("v3 seed data", () => {
  it("contains 30 spareparts with the expected condition split", () => {
    const normalized = sparepartSeeds.map(normalizeSeedRecord);

    expect(normalized).toHaveLength(30);
    expect(normalized.filter((item) => item.condition === "LAYAK_JUAL")).toHaveLength(6);
    expect(normalized.filter((item) => item.condition === "RUSAK")).toHaveLength(24);
  });

  it("includes branches introduced by the v3 reference data", () => {
    const branchNames = branchSeeds.map((branch) => branch.name);

    expect(branchNames).toEqual(expect.arrayContaining(["IGRSMG", "Sirclo", "GW Cargo TGR", "GW Ecomm", "HUB JKT 1"]));
  });

  it("contains the initial used goods records from the v3 reference", () => {
    const normalized = usedGoodsSeeds.map(normalizeUsedGoodsSeedRecord);

    expect(normalized).toHaveLength(4);
    expect(normalized.map((item) => item.name)).toEqual(expect.arrayContaining(["Kardus Bekas", "Palet", "Kertas", "Paku bekas"]));
    expect(new Set(normalized.map((item) => item.code)).size).toBe(normalized.length);
  });
});
