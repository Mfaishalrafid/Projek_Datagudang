import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { toUsedGoodsDTO } from "@/lib/mappers";

describe("used goods mapper", () => {
  it("maps all UsedGoods fields to the DTO expected by the UI", () => {
    const dto = toUsedGoodsDTO({
      id: "bb-kardus",
      code: "BB-20260521-0001",
      branchId: "branch-sirclo",
      inputDate: new Date("2026-05-21T00:00:00.000Z"),
      name: "Kardus Bekas",
      category: "KARDUS_KARTON",
      qty: new Prisma.Decimal(270),
      unit: "PCS",
      estimatedWeightKg: null,
      estimatedPrice: new Prisma.Decimal(0),
      condition: "LAYAK_JUAL",
      storageLocation: "GW Sirclo",
      pic: "Vincent",
      notes: "Siap jual",
      createdAt: new Date("2026-05-21T00:00:00.000Z"),
      updatedAt: new Date("2026-05-21T00:00:00.000Z"),
      branch: {
        id: "branch-sirclo",
        name: "Sirclo",
        code: "SIRCLO"
      }
    });

    expect(dto).toMatchObject({
      id: "bb-kardus",
      code: "BB-20260521-0001",
      branchName: "Sirclo",
      name: "Kardus Bekas",
      categoryLabel: "Kardus & Karton",
      qty: 270,
      unitLabel: "pcs",
      estimatedPrice: 0,
      conditionLabel: "LAYAK JUAL",
      storageLocation: "GW Sirclo",
      pic: "Vincent",
      notes: "Siap jual"
    });
  });
});
